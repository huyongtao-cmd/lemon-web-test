import moment from 'moment';
import { closeThenGoto } from '@/layouts/routerControl';
import {
  getInfo,
  getSumTable,
  createEquivalent,
  startProc,
  checkLastEquivalent,
} from '@/services/user/equivalent/equivalent';
import createMessage from '@/components/core/AlertMessage';
import { add } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';

const whereToGo = () => {
  const { from } = fromQs();
  return from === 'originated' ? '/user/task/originated' : '/user/task/received';
};

export default {
  namespace: 'SumCreate',
  state: {
    formData: {},
    list: [],
    total: undefined,
    tableStatus: undefined,
  },
  effects: {
    *queryInfo({ payload }, { call, put, all }) {
      const { formRes, tableRes } = yield all({
        formRes: call(getInfo, { taskId: payload }),
        tableRes: call(getSumTable, { taskId: payload }),
      });
      if (formRes.status === 200 && tableRes.status === 200) {
        const formData = formRes.response.datum;
        const list = Array.isArray(tableRes.response.datum) ? tableRes.response.datum : [];
        const applySettleEqva = list
          .map(l => l.applySettleEqva)
          .reduce((prev, curr) => add(prev || 0, curr || 0), 0);

        const applySettleAmt = applySettleEqva * formData.settlePrice;
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...formData, applySettleEqva, applySettleAmt },
            list: list.map(item => {
              if (item.settleStatus === 'FINISH')
                return {
                  ...item,
                  reportCompPercent: item.ssCompPercent,
                };
              return item;
            }),
            total: tableRes.response.total,
          },
        });
      }
    },

    *saveData({ payload }, { call, select }) {
      const settleDate = payload.settleDate && moment(payload.settleDate).format('YYYY-MM-DD');
      // console.log('settleDate, res', settleDate, res);
      const res = yield call(checkLastEquivalent, settleDate);
      if (res.status === 200 && res.response.ok) {
        if (res.response.datum.canSettlement) {
          const { status, response } = yield call(createEquivalent, payload);
          if (status === 200 && response.ok) {
            createMessage({ type: 'success', description: '????????????' });
            closeThenGoto(whereToGo());
          } else if (status === 100) {
            // ?????????????????????????????????
          } else {
            createMessage({ type: 'error', description: '????????????' });
          }
        } else {
          createMessage({
            type: 'warn',
            description: `????????????????????????${
              res.response.datum.lastSettlementDate
            }????????????????????????????????????????????????`,
          });
        }
      }
    },

    *submitData({ payload }, { call, put }) {
      const settleDate = payload.settleDate && moment(payload.settleDate).format('YYYY-MM-DD');
      const res = yield call(checkLastEquivalent, settleDate);
      if (res.status === 200 && res.response.ok) {
        if (res.response.datum.canSettlement) {
          const { status, response } = yield call(createEquivalent, payload);
          if (status === 200 && response.ok) {
            createMessage({ type: 'success', description: '????????????' });
            closeThenGoto(whereToGo());
          } else if (status === 100) {
            // ?????????????????????????????????
          } else {
            createMessage({ type: 'error', description: response.reason || '????????????' });
          }
        } else {
          createMessage({
            type: 'warn',
            description: `????????????????????????${
              res.response.datum.lastSettlementDate
            }????????????????????????????????????????????????`,
          });
        }
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
