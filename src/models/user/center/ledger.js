import { isEmpty } from 'ramda';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import { findResLedger, findResLedgerIo } from '@/services/user/center/ledger';

const makeSumItem = row =>
  Object.keys(row)
    // eslint-disable-next-line
    .map(key => {
      if (key === 'iqtySum' || key === 'iamtSum' || key === 'oqtySum' || key === 'oamtSum')
        return { [key]: undefined };
      return { [key]: -1 };
    })
    // eslint-disable-next-line
    .reduce((prev, curr) => {
      return { ...prev, ...curr };
    }, {});

const defaultFormData = {
  totalQty: null, // 账户当量余额
  totalAmt: null, // 账户现金余额
  avalAmt: null, // 账户可用余额
  frozenAmt: null, // 账户冻结余额
};

export default {
  namespace: 'userResLedger',

  state: {
    searchForm: {
      date: null, // 期间
      dateFrom: null,
      dateTo: null,
    },
    formData: { ...defaultFormData },
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response: ledgerData } = yield call(findResLedger);
      const { response } = yield call(findResLedgerIo, payload);
      // 合计表格数据
      const list = Array.isArray(response.rows) ? response.rows : [];

      let compileList = [];
      if (!isEmpty(list) && list[0] !== null) {
        // init sumItem
        const tail = {
          iqtySum: 0,
          iamtSum: 0,
          oqtySum: 0,
          oamtSum: 0,
        };
        // calc sum
        list.forEach(item => {
          const { iqtySum = 0, iamtSum = 0, oqtySum = 0, oamtSum = 0 } = item;
          tail.iqtySum = mathAdd(tail.iqtySum || 0, iqtySum || 0);
          tail.iamtSum = mathAdd(tail.iamtSum || 0, iamtSum || 0);
          tail.oqtySum = mathAdd(tail.oqtySum || 0, oqtySum || 0);
          tail.oamtSum = mathAdd(tail.oamtSum || 0, oamtSum || 0);
        });
        compileList = [
          // eslint-disable-next-line
          ...list.map(item => {
            return { ...item };
          }),
          { ...makeSumItem(list[0]), ...tail },
        ];
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: ledgerData.datum ? ledgerData.datum : { ...defaultFormData },
          dataSource: compileList,
          total: response.rows[0] !== null ? response.total : 0,
        },
      });
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
