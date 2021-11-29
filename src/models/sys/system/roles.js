import { findRoles, remove, disable, enable } from '@/services/sys/iam/roles';

const defaultSearchForm = {
  nameLike: undefined,
  custom: undefined,
  disabled: undefined,
};

export default {
  namespace: 'sysroles',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { custom, disabled, ...restPayload } = payload;
      const newPayload = {
        ...restPayload,
        custom: custom === 'all' ? undefined : custom,
        disabled: disabled === 'all' ? undefined : disabled,
      };
      const { response } = yield call(findRoles, newPayload);
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

    *removeRole({ payload }, { call, select, put }) {
      const { id } = payload;
      const data = yield call(remove, id);
      if (data.status === 200) {
        const { searchForm } = yield select(({ sysroles }) => sysroles);
        yield put({ type: 'query', payload: searchForm });
      }
    },

    *disable({ payload }, { call, put, select }) {
      const data = yield call(disable, payload.code);
      if (data.status === 200) {
        const { searchForm } = yield select(({ sysroles }) => sysroles);
        yield put({ type: 'query', payload: searchForm });
      }
    },

    *enable({ payload }, { call, put, select }) {
      const data = yield call(enable, payload.code);
      if (data.status === 200) {
        const { searchForm } = yield select(({ sysroles }) => sysroles);
        yield put({ type: 'query', payload: searchForm });
      }
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
  },
};
