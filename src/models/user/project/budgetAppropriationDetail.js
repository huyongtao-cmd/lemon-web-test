import { budgetAppropriationDetail } from '@/services/user/project/project';
import { getViewConf } from '@/services/gen/flow';

export default {
  namespace: 'budgetAppropriationDetail',
  state: {
    formData: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(budgetAppropriationDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
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
