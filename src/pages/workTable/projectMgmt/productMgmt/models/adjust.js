/**
 * 该model只负责提供reducers处理数据的方法，
 * 不提供effects方法，
 * effects方法统一由common-model提供
 */
import { commonModelReducers } from '@/utils/production/modelUtils';

const defaultState = {
  formData: {
    productStatus: 'CREATE',
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
};
export default {
  namespace: 'productMgmtAdjust',

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
