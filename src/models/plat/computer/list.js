import { queryList, deleteComputers } from '@/services/plat/computer';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

export default {
  namespace: 'platComputer',
  state: {
    searchForm: {},
    dataSource: [],
    total: 0,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        applyDate:
          payload && payload.applyDate ? moment(payload.applyDate).format('YYYY-MM-DD') : undefined,
        startPeriodId:
          payload && payload.startPeriodId
            ? moment(payload.startPeriodId).format('YYYYMM')
            : undefined,

        sortBy: (payload && payload.sortBy) || 'id',
        sortDirection: (payload && payload.sortDirection) || 'DESC',
      };

      const {
        response: { rows, total },
      } = yield call(queryList, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total: total || 0,
        },
      });
    },
    *deleteRow({ payload }, { call, put }) {
      const { response } = yield call(deleteComputers, payload.ids);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        yield put({ type: 'query', payload: payload.queryParams });
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
  },
};
