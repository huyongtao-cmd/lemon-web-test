import { queryMyExtrwork } from '@/services/user/project/project';

export default {
  namespace: 'userCenterMyExtrwork',

  state: {
    dataSource: [],
    searchForm: {
      date: [],
    },
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        date: [startDate, endDate],
      } = payload;
      const { response } = yield call(queryMyExtrwork, {
        ...payload,
        startDate,
        endDate,
      });
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
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
  },
};
