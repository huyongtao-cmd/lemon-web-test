import { queryCmsList, deleteCms } from '@/services/sys/market/cms';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysCms',

  state: {
    dataSource: [],
    searchForm: {},
    total: 0,
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const { response } = yield call(queryCmsList, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 删除某个角色所有数据权限
    *delete({ payload }, { put, call }) {
      const { status, response } = yield call(deleteCms, payload.ids);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        yield put({ type: 'fetch', payload: payload.queryParams });
      } else {
        createMessage({ type: 'error', description: response.reason || '删除失败' });
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
  },
};
