import { queryDistributes, deleteDistByIds } from '@/services/user/distribute/distribute';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  distStatus: ['1', 'DISTRIBUTED'],
};

export default {
  namespace: 'userMyDist',

  state: {
    dataSource: [],
    total: 0,
    searchForm: defaultSearchForm,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        isMyDist: 1,
      };
      const { response } = yield call(queryDistributes, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },

    *deleteDistByIds({ payload }, { call, put }) {
      const { status, response } = yield call(deleteDistByIds, payload.ids);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
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
