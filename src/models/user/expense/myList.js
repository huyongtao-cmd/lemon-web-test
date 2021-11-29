import { queryMyExpenses, deleteExpenses } from '@/services/user/expense/expense';

export default {
  namespace: 'userMyExpenseList',

  state: {
    // 查询系列
    searchForm: {
      allocationFlag: 0, //
    },
    dataSource: [],
    total: 0,
    // 费用报销
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        allocationFlag: payload && payload.allocationFlag ? 1 : 0,
        applyDate: undefined,
        applyDateStart:
          payload && payload.applyDate && payload.applyDate[0]
            ? payload.applyDate[0].format('YYYY-MM-DD')
            : undefined,
        applyDateEnd:
          payload && payload.applyDate && payload.applyDate[1]
            ? payload.applyDate[1].format('YYYY-MM-DD')
            : undefined,
        sortBy: (payload && payload.sortBy) || 'id',
        sortDirection: (payload && payload.sortDirection) || 'DESC',
      };

      const {
        response: { rows, total },
      } = yield call(queryMyExpenses, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total: total || 0,
        },
      });
    },
    *delete({ payload }, { call, put }) {
      const ids = payload.join(',');
      const { status, response } = yield call(deleteExpenses, ids);
      if (response && response.ok) {
        return {
          status,
          result: true,
        };
      }
      return {
        status,
        result: true,
      };
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
  },
};
