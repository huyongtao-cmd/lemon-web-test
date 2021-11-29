import moment from 'moment';
import { queryResWorkList } from '@/services/plat/reportMgmt';
import { selectUsersWithBu, selectBusWithOus } from '@/services/gen/list';

const defaultSearchForm = {
  year: moment().year(),
};

export default {
  namespace: 'resWork',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: 0,
    buList: [],
    orgList: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(queryResWorkList, payload);
      yield put({
        type: 'updateState',
        payload: {
          list: Array.isArray(rows) ? rows : [],
          total: total || 0,
        },
      });
    },
    *queryOrgSelect({ payload }, { call, put }) {
      const { response } = yield call(selectBusWithOus);
      yield put({
        type: 'updateState',
        payload: {
          orgList: Array.isArray(response) ? response : [],
        },
      });
    },
    *queryBuSelect({ payload }, { call, put }) {
      const { response } = yield call(selectUsersWithBu);
      yield put({
        type: 'updateState',
        payload: {
          buList: Array.isArray(response) ? response : [],
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
