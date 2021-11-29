/**
 * 该model只负责提供reducers处理数据的方法，
 * 不提供effects方法，
 * effects方法统一由common-model提供
 */
import { commonModelReducers } from '@/utils/production/modelUtils';
import { isNil, type } from 'ramda';
import update from 'immutability-helper';

const defaultState = {
  formData: {
    detailEntities: [],
    prepay: false,
  },
  delIds: [],
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
};
export default {
  namespace: 'receivableCreate',

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
