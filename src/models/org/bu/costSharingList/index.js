import { queryCostSharing } from '@/services/org/bu/costSharingList';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'costSharingList',

  state: {
    // 查询系列
    searchForm: {},
    list: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
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
      } = yield call(queryCostSharing, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          list: Array.isArray(rows) ? rows : [],
          total,
        },
      });
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
          selectedRowKeys: [],
        },
      };
    },
  },
};
