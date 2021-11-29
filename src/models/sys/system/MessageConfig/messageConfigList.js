import {
  messageConfigListUriRq,
  messageConfigDeleteUriRq,
} from '@/services/sys/system/messageConfiguration';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};

export default {
  namespace: 'messageConfigList',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(messageConfigListUriRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      } else {
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *delete({ payload }, { call, select, put }) {
      const { status, response } = yield call(messageConfigDeleteUriRq, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        const { searchForm } = yield select(({ messageConfigList }) => messageConfigList);
        yield put({
          type: 'query',
          payload: searchForm,
        });
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '删除失败' });
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
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
