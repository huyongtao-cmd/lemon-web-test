import { queryTicketMgmtList, startBatch } from '@/services/plat/ticketMgmt';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};

export default {
  namespace: 'ticketMgmt',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryTicketMgmtList, payload);
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
    *batchExpense({ payload }, { call, put }) {
      const { ids, queryParams } = payload;
      const { status, response } = yield call(startBatch, ids);
      if (status === 200) {
        if (response.ok) {
          response.reason
            ? response.reason
                .split(';')
                .filter(Boolean)
                .map(msg => createMessage({ type: 'warn', description: msg }))
            : createMessage({ type: 'success', description: '操作成功' });
          yield put({ type: 'query', payload: queryParams });
        } else {
          response.reason
            ? response.reason
                .split(';')
                .filter(Boolean)
                .map(msg => createMessage({ type: 'warn', description: msg }))
            : createMessage({ type: 'warn', description: '操作失败' });
        }
        yield put({ type: 'updateSearchForm', payload: { selectRowKeys: [] } });
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
