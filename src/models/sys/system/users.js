import { findUsers, findUsersRes, disable, enable, pwdReset } from '@/services/sys/iam/users';
import createMessage from '@/components/core/AlertMessage';
import { convertCode } from '@/components/core/I18n/convert';

const defaultSearchForm = {
  nameLike: undefined,
  roleCode: undefined,
  disabled: undefined,
  offset: 0,
  limit: 10,
};

export default {
  namespace: 'sysusers',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { disabled, ...restPayload } = payload;
      const newPayload = {
        ...restPayload,
        disabled: disabled === 'all' ? undefined : disabled,
      };
      const { response } = yield call(findUsers, newPayload);
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

    *disable({ payload }, { call, put, select }) {
      const data = yield call(disable, payload.id);
      if (data.status === 200) {
        const { searchForm } = yield select(({ sysroles }) => sysroles);
        yield put({ type: 'query', payload: searchForm });
      }
    },

    *enable({ payload }, { call, put, select }) {
      const data = yield call(enable, payload.id);
      if (data.status === 200) {
        const { searchForm } = yield select(({ sysroles }) => sysroles);
        yield put({ type: 'query', payload: searchForm });
      }
    },

    *resetPwd({ payload }, { call, put }) {
      const { status, response } = yield call(pwdReset, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '重置密码成功' });
        yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
      } else {
        createMessage({
          type: 'error',
          description:
            '重置密码失败' + (response.errCode ? ': ' + convertCode(response.errCode) : ''),
        });
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
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
