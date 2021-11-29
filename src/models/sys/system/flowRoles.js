import { getRoles, deleteRole } from '@/services/sys/system/flowRole';

const defaultSearchForm = {
  flowRoleCode: undefined,
  flowRoleName: undefined,
};

export default {
  namespace: 'flowRoles',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(getRoles, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },
    *delete({ payload }, { call, put }) {
      const { status } = yield call(deleteRole, payload);
      if (status === 200) {
        yield put({ type: 'query' });
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
