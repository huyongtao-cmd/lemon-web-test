import { commonModelReducers } from '@/utils/production/modelUtils';
import { payrollImportRq } from '@/services/production/res';

const defaultState = {
  formData: {},
  formMode: 'EDIT',
};
export default {
  namespace: 'resPayRoll',
  state: defaultState,
  effects: {
    *upload({ payload }, { call, put, select }) {
      const { status, response } = yield call(payrollImportRq, payload);
      if (status === 200) {
        return response;
      }
      return {};
    },
  },
  reducers: {
    // ...commonModelReducers(defaultState),
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
