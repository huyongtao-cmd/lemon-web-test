import { queryTeamInfo } from '@/services/user/center/myTeam';
import { selectUsersWithBu } from '@/services/gen/list';

const defaultSearchForm = {};

export default {
  namespace: 'myTeam',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: null,
    buList: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryTeamInfo, payload);
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
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
