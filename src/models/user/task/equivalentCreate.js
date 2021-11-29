import {
  equivalentCreate,
  equivalentDetailRq,
  queryCapasetLevelUriRq,
} from '@/services/user/task/equivalent';
import { queryCascaderUdc } from '@/services/gen/app';
import { launchFlowFn } from '@/services/sys/flowHandle';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { selectCapasetLevelBy } from '@/services/gen/list';

const defaultFormData = {
  acceptMethod: '01',
  acceptMethodName: '任务包',
  pricingMethod: 'SUM',
  pricingMethodName: '总价',
  jobType1: undefined,
  jobType2: undefined,
  capasetLevelId: undefined,
};
export default {
  namespace: 'equivalentCreate',
  state: {
    formData: defaultFormData,
    jobType2List: [],
    capasetLeveldList: [],
  },
  effects: {
    *queryCapasetLevel({ payload }, { call, put }) {
      const { status, response } = yield call(queryCapasetLevelUriRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              jobType1: response.datum ? response.datum.jobType1 : undefined,
              jobType2: response.datum ? response.datum.jobType2 : undefined,
              capasetLevelId: response.datum ? response.datum.capasetLevelId : undefined,
            },
          });
        }
        return response.datum;
      }
      return {};
    },
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(equivalentDetailRq, payload);
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateForm',
            payload: {
              ...defaultFormData,
              ...response.datum,
            },
          });
        }
      }
    },
    // 当量申请提交，发起流程
    *submit({ payload }, { call, put }) {
      const { response } = yield call(equivalentCreate, payload);
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'ACC_A70',
          value: {
            id: response.datum.id,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '申请提交成功' });
          closeThenGoto('/user/flow/process?type=procs');
          return true;
        }
        createMessage({ type: 'error', description: response2.reason || '申请提交失败' });
        return false;
      }
      createMessage({ type: 'error', description: response.reason || '申请提交失败' });
      return false;
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
        },
      });
    },
    // 工种 + 工种子类 -> 复合能力 注意这里是两个字段联动一个，不是直接上下级关系。
    *updateCapasetLeveldList({ payload }, { call, put }) {
      const { jobType1, jobType2 } = payload;
      if (!jobType1 || !jobType2) {
        return;
      }
      const { response } = yield call(selectCapasetLevelBy, {
        jobType1,
        jobType2,
      });
      yield put({
        type: 'updateState',
        payload: {
          capasetLeveldList: Array.isArray(response) ? response : [],
        },
      });
    },

    // 根据工种获取工种子类的信息
    *updateJobType2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:JOB_TYPE2',
        parentDefId: 'COM:JOB_TYPE1',
        parentVal: payload,
      });

      yield put({
        type: 'updateState',
        payload: {
          jobType2List: Array.isArray(response) ? response : [],
        },
      });
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
