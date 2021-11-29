import { commonModelReducers } from '@/utils/production/modelUtils';
import { isNil, type } from 'ramda';
import update from 'immutability-helper';

const defaultState = {
  formData: {
    detailEntities: [],
  },
  delIds: [],
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'DESCRIPTION',
};
export default {
  namespace: 'receivableDetail',

  state: defaultState,

  effects: {},

  reducers: {
    ...commonModelReducers(defaultState),

    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      if (Array.isArray(element) && !element.filter(v => type(v) !== 'Object').length) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
          }
        });
      } else {
        newFormData = { ...formData, ...payload };
      }

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
  },
};
