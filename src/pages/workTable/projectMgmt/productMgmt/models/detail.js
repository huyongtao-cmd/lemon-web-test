import { commonModelReducers } from '@/utils/production/modelUtils';

const defaultState = {
  formData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'DESCRIPTION',
};
export default {
  namespace: 'productMgmtDetail',

  state: defaultState,

  effects: {},

  reducers: {
    ...commonModelReducers(defaultState),

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
