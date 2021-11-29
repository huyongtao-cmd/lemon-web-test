// 任务包申请
import createMessage from '@/components/core/AlertMessage';
import {
  queryTaskApplyById,
  saveTaskApply,
  submitTaskApply,
  doTaskTaskApply,
  qetCapasetDefault,
  selectUsers,
} from '@/services/user/task/task';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectCapasetLevelBy } from '@/services/gen/list';
import { closeThenGoto } from '@/layouts/routerControl';

const formDataModal = {
  disterResId: null,
  receiverResId: null,
  taskName: null,
  jobType1: null,
  jobType2: null,
  capasetLevelId: null,
  reasonType: null,
  reasonDesc: null,
  acceptMethod: null,
  pricingMethod: null,
  eqvaQty: null,
  eqvaRatio: null,
  planStartDate: null,
  planEndDate: null,
  remark: null,
  createUserId: null,
  createTime: null,
};

export default {
  namespace: 'userTaskApply',

  state: {
    formData: {
      ...formDataModal,
    },
    mode: 'create',
    resList: [],
    resSource: [],
    jobType2List: [],
    capasetLeveldList: [],
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryTaskApplyById, payload.id);
      if (response && response.ok) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            formData: datum || {},
            mode: payload.mode || 'create',
          },
        });

        // 联动相关数据初始化
        // 工种大类带工种子类
        if (datum.jobType1) {
          yield put({
            type: 'updateJobType2',
            payload: datum.jobType1,
          });
        }
        // 工种子类带能力级别
        if (datum.jobType2) {
          yield put({
            type: 'updateCapasetLeveldList',
            payload: {
              jobType1: datum.jobType1,
              jobType2: datum.jobType2,
            },
          });
        }
      }
    },
    *queryCapasetDefault(_, { call, put, select }) {
      const { response } = yield call(qetCapasetDefault);
      if (response && response.ok) {
        const { datum } = response;
        const {
          user: { extInfo },
        } = yield select(({ user: { user } }) => ({ user }));
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...formDataModal,
              jobType1: datum && datum.jobType1,
              jobType2: datum && datum.jobType2,
              capasetLevelId: datum && datum.capasetLevelId,
              remark: null,
              receiverResId: extInfo && extInfo.resId, // 接包人(默认当前登录人)
              receiverResName: extInfo && extInfo.resName,
            },
          },
        });

        // 联动相关数据初始化
        // 工种大类带工种子类
        if (datum && datum.jobType1) {
          yield put({
            type: 'updateJobType2',
            payload: datum.jobType1,
          });
        }
        // 工种子类带能力级别
        if (datum && datum.jobType2) {
          yield put({
            type: 'updateCapasetLeveldList',
            payload: {
              jobType1: datum.jobType1,
              jobType2: datum.jobType2,
            },
          });
        }
      }
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
    // 获得资源下拉数据
    *queryResList({ payload }, { call, put }) {
      const response = yield call(selectUsers);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            resList: Array.isArray(response.response) ? response.response : [],
            resSource: Array.isArray(response.response) ? response.response : [],
          },
        });
      }
    },
    // 保存
    *save({ payload }, { call, put }) {
      const { status, response } = yield call(saveTaskApply, payload.formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        if (payload.apprId) {
          // 再次提交流程
          const result = yield call(doTaskTaskApply, payload.apprId);
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/flow/process`);
          return;
        }
        // 提起流程
        const result = yield call(submitTaskApply, response.datum);
        if (result.response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/task/detail?id=${response.datum}`);
        }
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: `操作未成功，原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: { formData: { ...formDataModal }, mode: 'create' },
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
    // 修改form表单字段内容，将数据保存到state
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
