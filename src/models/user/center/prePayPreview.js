import { getPrePayDetail } from '@/services/user/center/prePay';
import { getViewConf } from '@/services/gen/flow';

const defaultFlowForm = {
  remark: undefined,
  salesmanResId: {},
  dirty: false,
};

export default {
  namespace: 'prePayPreview',
  state: {
    formData: {},
    fieldsConfig: {},
    flowForm: defaultFlowForm,
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(getPrePayDetail, payload);
      if (status === 200) {
        const formData = response.datum || {};
        yield put({ type: 'updateForm', payload: formData });
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: defaultFlowForm,
          },
        });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
    cleanFlow(state, { payload }) {
      return {
        ...state,
        fieldsConfig: {},
        flowForm: defaultFlowForm,
      };
    },
  },
};
