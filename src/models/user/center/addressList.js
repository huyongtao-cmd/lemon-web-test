import { queryAddressList } from '@/services/user/center/addressList';

const defaultSearchForm = {
  searchKey: null,
  empNo: null,
  baseBuId: null,
  baseCity: null,
  mobile: null,
  email: null,
};

export default {
  namespace: 'addressList',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: null,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryAddressList, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
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
