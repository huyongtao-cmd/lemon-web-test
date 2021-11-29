// 活动完工申请详情
import { queryActivityById } from '@/services/user/task/task';
import { getViewConf } from '@/services/gen/flow';

export default {
  namespace: 'resActFinishDetail',

  state: {
    formData: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
    evalVisible: false,
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryActivityById, { id: payload.id });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response || {},
          },
        });
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      console.log(response);
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
