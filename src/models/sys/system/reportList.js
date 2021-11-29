import { queryReportList, deleteReport } from '@/services/sys/system/report';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  searchKey: null,
  empNo: null,
  baseBuId: null,
  baseCity: null,
  mobile: null,
  email: null,
};

export default {
  namespace: 'reportMgtList',
  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: null,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryReportList, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *delete({ payload }, { call, put }) {
      const { status, response } = yield call(deleteReport, payload);
      if (status === 100) return;
      if (response && response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        yield put({
          type: 'query',
        });
        return;
      }
      createMessage({ type: 'error', description: response.reason || '删除失败' });
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
