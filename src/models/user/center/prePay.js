import createMessage from '@/components/core/AlertMessage';
import { qeuryPrePayList, deletePrePay } from '@/services/user/center/prePay';

const defaultSearchForm = {};

export default {
  namespace: 'prePayList',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(qeuryPrePayList, payload);
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
    *delete({ payload }, { call, put }) {
      const { status, response } = yield call(deletePrePay, payload);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        return true;
      }
      createMessage({ type: 'error', description: response.errCode || '删除失败' });
      return false;
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
