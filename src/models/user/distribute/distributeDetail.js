import { findDistribute, queryDistResponse } from '@/services/user/distribute/distribute';
import { findUserTaskById } from '@/services/user/task/task';
import { findProjectById } from '@/services/user/project/project';
import { getViewConf } from '@/services/gen/flow';

const formDataModal = {
  reasonType: null, // 派发对象[事由id，事由类型],
  reasonId: null, // 事由id
  disterResId: null, // 派发人
  distTime: null, // 派发时间
  // distNo: null, // 派发编号
  distMethod: null, // 派发方式
  receiverResId: null, // 接收资源
  receiverResName: null, // 接收资源名称
  distDesc: null, // 派发说明
  distStatus: 'create', // 派发状态

  // 应答人数（上限）,广播天数/剩余天数,
  respNumber: null,
  broadcastDays: null,
  remainingDays: null,

  capabilitySet: null,
  capabilityJudge: null, // 复合能力
  languageRequirement: null, // 语言能力要求
  workStyle: null, // 现场|远程
  otherCapability: null, // 其他能力要求
  timeRequirement: null, // 时间要求
  resBase: null, // 资源所在地
  workMethod: null, // 兼职|全职
  resType: null, // 资源类型
  workCountry: null,
  workProvince: null,
  workPlace: null,
  workDetailadd: null, // 工作地
  planStartDate: null, // 预计开始时间
  minCreditPoint: null, // 最低信用积分
  planEndDate: null, // 预计结束时间
  minSecurityLevel: null, // 最低安全级别
  remark: null, // 备注
  needCapaNum: null, // 该任务需要的单项能力还有几项没获得
  // apprStatus: null,
};
export default {
  namespace: 'userDistDetail',

  state: {
    formData: { ...formDataModal },
    taskFormData: null,
    projFormData: null,
    responseList: [],
    mode: 'create',
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      yield put({ type: 'clean' });
      const { response } = yield call(findDistribute, payload.id);

      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
            mode: payload.mode || 'create',
          },
        });
        const {
          datum: { reasonType, reasonId },
        } = response;
        if (reasonType === 'TASK' && reasonId) {
          const result = yield call(findUserTaskById, { id: reasonId });
          yield put({
            type: 'updateState',
            payload: {
              taskFormData: result.response.datum || {},
            },
          });
        } else if (reasonType === 'PROJECT' && reasonId) {
          const result = yield call(findProjectById, reasonId);
          yield put({
            type: 'updateState',
            payload: {
              projFormData: result.response.datum || {},
            },
          });
        }
      }
    },

    // 响应列表
    *queryDistResponse({ payload }, { call, put }) {
      const { response } = yield call(queryDistResponse, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            responseList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...formDataModal },
          taskFormData: null,
          projFormData: null,
          responseList: [],
          mode: 'create',
          fieldsConfig: {},
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
