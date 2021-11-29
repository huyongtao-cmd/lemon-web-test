import { queryUnfreezeDetail } from '@/services/user/equivalent/equivalent';
import { getViewConf } from '@/services/gen/flow';

export default {
  namespace: 'unfreezeDetail',
  state: {
    formData: {},
    dataSource: [],
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryUnfreezeDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            dataSource: response.unfreezeDtlViews,
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
