import { isEmpty } from 'ramda';
import {
  queryPurchaseContractList,
  queryPlanList,
  contractListDelRq,
} from '@/services/user/Contract/sales';
import { add as mathAdd, sub } from '@/utils/mathUtils';

const makeSumItem = row =>
  Object.keys(row)
    // eslint-disable-next-line
    .map(key => {
      if (key === 'actualPayAmt' || key === 'unPayAmt') return { [key]: undefined };
      return { [key]: -1 };
    })
    // eslint-disable-next-line
    .reduce((prev, curr) => {
      return { ...prev, ...curr };
    }, {});

export default {
  namespace: 'userContractPurchasesTab',

  state: {
    dataSource: [],
    searchForm: {},
    total: null,
    list: [],
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(queryPurchaseContractList, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.datum) ? response.datum : [],
            total: response.total,
          },
        });
      }
    },
    // 查询付款计划
    *queryRecvPurList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryPlanList, { pcontractId: payload });
      if (status === 200) {
        const list = Array.isArray(response.rows) ? response.rows : [];
        let compileList = [];
        if (!isEmpty(list)) {
          // init sumItem
          const tail = {
            actualPayAmt: 0,
            unPayAmt: 0,
            stage: -1,
          };
          // calc sum
          list.forEach(item => {
            const { actualPayAmt = 0, unPayAmt = 0 } = item;
            tail.actualPayAmt = mathAdd(tail.actualPayAmt || 0, actualPayAmt || 0);
            tail.unPayAmt = mathAdd(tail.unPayAmt || 0, unPayAmt || 0);
          });
          compileList = [
            // eslint-disable-next-line
            ...list.map(item => {
              return { ...item, unPayAmt: sub(item.payAmt || 0, item.actualPayAmt || 0) };
            }),
            { ...makeSumItem(list[0]), ...tail, id: 0 },
          ];

          yield put({
            type: 'updateState',
            payload: {
              list: compileList,
            },
          });
        }
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(contractListDelRq, payload);
      if (status === 200) {
        return response;
      }
      return {};
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
