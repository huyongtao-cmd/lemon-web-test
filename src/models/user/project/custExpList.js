import {
  queryCustExpList,
  syncCustExpInfo,
  cancelCustExp,
  updateCustExpRecv,
} from '@/services/user/expense/custExp';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'custExpenseList',

  state: {
    searchForm: {
      allocationFlag: 0,
    },
    list: [],
    total: 0,
    formData: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        allocationFlag: payload && payload.allocationFlag ? 1 : 0,
        applyDate: undefined,
        applyDateStart:
          payload && payload.applyDate && payload.applyDate[0] ? payload.applyDate[0] : undefined,
        applyDateEnd:
          payload && payload.applyDate && payload.applyDate[1] ? payload.applyDate[1] : undefined,
      };

      const {
        response: { rows, total },
      } = yield call(queryCustExpList, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          list: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },
    *sync({ payload }, { call, put }) {
      const {
        response: { ok },
      } = yield call(syncCustExpInfo);
      if (ok) {
        createMessage({ type: 'success', description: '同步成功' });
        yield put({
          type: 'query',
          payload,
        });
      } else {
        createMessage({ type: 'error', description: '同步失败' });
      }
    },

    *cancel({ payload }, { call, put }) {
      const { reimId, searchForm } = payload;
      const {
        response: { ok },
      } = yield call(cancelCustExp, { reimId });
      if (ok) {
        createMessage({ type: 'success', description: '取消成功' });
        yield put({
          type: 'query',
          payload: searchForm,
        });
      } else {
        createMessage({ type: 'error', description: '取消失败' });
      }
    },

    *record({ payload }, { call, put }) {
      const { reimId, searchForm } = payload;
      const {
        response: { ok },
      } = yield call(cancelCustExp, { reimId });
      if (ok) {
        yield put({
          type: 'query',
          payload: searchForm,
        });
        return createMessage({ type: 'success', description: '补录成功' });
      }
      return createMessage({ type: 'error', description: '补录失败' });
    },
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          searchForm: {
            allocationFlag: 0,
          },
          list: [],
          total: 0,
          selectedRowKeys: [],
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
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
          allocationFlag: 0,
          selectedRowKeys: [],
        },
      };
    },
  },
};
