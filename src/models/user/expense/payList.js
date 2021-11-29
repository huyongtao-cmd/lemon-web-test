import { queryExpensePay, savePay } from '@/services/user/expense/expense';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

export default {
  namespace: 'userExpensePayList',

  state: {
    searchForm: {
      allocationFlag: 0,
    },
    dataSource: [],
    total: 0,
    accPayBatchIds: null, // 选中的记账导出记录id字符串数组
    jdePay: {
      // jde报销记账表对象
      id: null,
      accPayBatchId: null,
      accountNo: null,
      accName: null,
      accCode: null,
      subAccCode: null,
      ledgerDate: moment().format('YYYY-MM-DD'),
      remark: null,
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        // exportTime: 'batchTime',
        batchTime: undefined,
        batchTimeStart:
          payload && payload.batchTime && payload.batchTime[0]
            ? payload.batchTime[0].format('YYYY-MM-DD')
            : undefined,
        batchTimeEnd:
          payload && payload.batchTime && payload.batchTime[1]
            ? payload.batchTime[1].format('YYYY-MM-DD')
            : undefined,
        exportTime: undefined,
        exportTimeStart:
          payload && payload.exportTime && payload.exportTime[0]
            ? payload.exportTime[0].format('YYYY-MM-DD')
            : undefined,
        exportTimeEnd:
          payload && payload.exportTime && payload.exportTime[1]
            ? payload.exportTime[1].format('YYYY-MM-DD')
            : undefined,
      };
      // console.log('-----new', newPayload)

      const {
        response: { rows, total },
      } = yield call(queryExpensePay, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total: total || 0,
        },
      });
    },
    *savePay({ payload }, { call, select, put }) {
      const { accPayBatchIds, jdePay } = yield select(
        ({ userExpensePayList }) => userExpensePayList
      );
      if (!accPayBatchIds || accPayBatchIds.length === 0) {
        createMessage({ type: 'warn', description: '请先选择记录！' });
        return {};
      }
      const { state, response } = yield call(savePay, {
        accPayBatchIds: accPayBatchIds.join(','),
        jdePay,
      });
      if (state === 100) {
        return {};
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            accPayBatchIds: null,
            jdePay: {
              id: null,
              accPayBatchId: null,
              accName: null,
              accCode: null,
              subAccCode: null,
              ledgerDate: moment().format('YYYY-MM-DD'),
              remark: null,
            },
          },
        });
      } else {
        createMessage({ type: 'error', description: '保存失败！' + response.reason });
      }
      return response;
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
