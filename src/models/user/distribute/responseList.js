import { queryResponses } from '@/services/user/distribute/distribute';
import { genFakeId } from '@/utils/mathUtils';

const defaultSearchForm = {
  distStatus: ['BROADCASTING'],
};

export default {
  namespace: 'userDistResponse',

  state: {
    dataSource: [],
    total: 0,
    searchForm: defaultSearchForm,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryResponses, payload);
      const newDataSource = Array.isArray(response.rows)
        ? response.rows.map(item => ({ ...item, key: genFakeId(-1) }))
        : [];
      yield put({
        type: 'updateState',
        payload: {
          dataSource: newDataSource,
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
  },
};
