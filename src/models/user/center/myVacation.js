import { queryVacationList } from '@/services/user/center/myTeam';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const defaultSearchForm = {
  resId: 0,
  vacationYear: moment().year(),
  vacationType: null,
};

export default {
  namespace: 'userMyVacation',

  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryVacationList, payload);
      if (status === 100) return;
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
  },
};
