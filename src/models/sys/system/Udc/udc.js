import { queryUdcList } from '@/services/sys/system/udc';

export default {
  namespace: 'sysUdc',

  state: {
    dataSource: [],
    searchForm: {},
    total: 0,
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const { response } = yield call(queryUdcList, payload);
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
