// 任务包申请详情
import { queryTaskApplyById } from '@/services/user/task/task';
import { getViewConf } from '@/services/gen/flow';

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
  apprStatus: null,
};

export default {
  namespace: 'userTaskApplyDetail',

  state: {
    formData: {
      ...formDataModal,
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(queryTaskApplyById, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: datum || {},
          },
        });
        return datum;
      }
      return {};
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
        payload: { formData: { ...formDataModal } },
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
