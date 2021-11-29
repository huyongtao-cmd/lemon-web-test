import { queryProjectInfo, queryProjectList } from '@/services/user/project/project';
import { selectUsersWithBu } from '@/services/gen/list';

export default {
  namespace: 'userProjectExpenseLog',

  state: {
    // 查询系列
    searchForm: {},
    dataSource: [],
    total: 0,
    formData: {},
    buList: [],
  },

  effects: {
    *queryInfo({ payload }, { call, put }) {
      const { response } = yield call(queryProjectInfo, payload);
      yield put({
        type: 'updateState',
        payload: { formData: response.datum || {} },
      });
    },
    *query({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(queryProjectList, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
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
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
