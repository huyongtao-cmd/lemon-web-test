import { commonModelReducers } from '@/utils/production/modelUtils';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';
import { myPayRollPagingRq } from '@/services/production/res';

const defaultState = {
  formData: {},
  searchForm: { year: moment().year() },
  time: {},
};

export default {
  namespace: 'myPayRoll',
  state: defaultState,

  effects: {
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(myPayRollPagingRq, payload);
      yield put({
        type: 'updateState',
        payload: {
          formData: response.data.rows,
          time: payload,
        },
      });
      return response;
    },
  },
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

    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },
};
