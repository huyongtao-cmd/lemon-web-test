import { usersListUriRq } from '@/services/sys/system/permissionOverview';

const defaultSearchForm = {};

export default {
  namespace: 'usersDimension',
  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: 0,
  },
  effects: {
    // 用户维度查询
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(usersListUriRq, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          dataSource: [],
          total: 0,
          searchForm: {},
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
        searchForm: {
          ...defaultSearchForm,
        },
      };
    },
  },
};
