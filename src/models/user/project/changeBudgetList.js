import { ChangeBudgetHistoryListUri } from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};

export default {
  namespace: 'changeBudgetList',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: 0,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(ChangeBudgetHistoryListUri, payload.projId);
      if (status === 200) {
        const { rows, total, datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(datum) ? datum : [],
            total,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
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
