import moment from 'moment';
import { closeThenGoto } from '@/layouts/routerControl';
import {
  getInfo,
  getSumTable,
  createEquivalent,
  startProc,
  checkLastEquivalent,
} from '@/services/user/equivalent/equivalent';
import { doTaskTaskApply } from '@/services/user/task/task';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

const whereToGo = () => {
  const { sourceUrl } = fromQs();
  return sourceUrl || '/plat/intelStl/list';
};

export default {
  namespace: 'SumEdit',
  state: {
    formData: {},
    list: [],
    total: undefined,
    tableStatus: undefined,
  },
  effects: {
    *queryInfo({ payload }, { call, put, all }) {
      const { formRes, tableRes } = yield all({
        formRes: call(getInfo, { id: payload }),
        tableRes: call(getSumTable, { id: payload }),
      });
      if (formRes.status === 200 && tableRes.status === 200) {
        const formData = formRes.response.datum || {};
        const list = Array.isArray(tableRes.response.datum) ? tableRes.response.datum : [];
        // const applySettleEqva = list.map(l => l.applySettleEqva).reduce((prev, curr) => add(prev || 0, curr || 0), 0);
        yield put({
          type: 'updateState',
          payload: {
            formData,
            // formData: { ...formData, applySettleEqva },
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
    *saveData({ payload }, { call, put, select }) {
      const settleDate = payload.settleDate && moment(payload.settleDate).format('YYYY-MM-DD');
      const res = yield call(checkLastEquivalent, settleDate);

      // 校验当前日期是否可以结算
      if (res.status === 200 && res.response.ok) {
        if (res.response.datum.canSettlement) {
          const { status, response } = yield call(createEquivalent, payload);

          if (status === 200 && response.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto(whereToGo());
          } else if (status === 100) {
            // 主动取消请求，不做操作
          } else {
            createMessage({ type: 'error', description: '保存失败' });
          }
        } else {
          createMessage({
            type: 'warn',
            description: `结算日期已冻结至${
              res.response.datum.lastSettlementDate
            }，请选择此日期之后的时间进行结算`,
          });
        }
      }
    },
    *submitData({ payload }, { call, put }) {
      const { formData, taskId, remark } = payload;
      const settleDate = formData.settleDate && moment(formData.settleDate).format('YYYY-MM-DD');
      const res = yield call(checkLastEquivalent, settleDate);
      // 校验当前日期是否可以结算
      if (res.status === 200 && res.response.ok) {
        if (res.response.datum.canSettlement) {
          const { status, response } = yield call(createEquivalent, formData);

          if (status === 200 && response.ok) {
            if (taskId) {
              const result = yield call(doTaskTaskApply, taskId, remark);

              if (result.status === 200 && !result.response.code) {
                createMessage({ type: 'success', description: '提交成功' });
                closeThenGoto(whereToGo());
              } else {
                createMessage({ type: 'error', description: response.reason || '提交失败' });
              }
              return;
            }
            createMessage({ type: 'success', description: '提交成功' });
            closeThenGoto(whereToGo());
          } else if (status === 100) {
            // 主动取消请求，不做操作
          } else {
            createMessage({ type: 'error', description: response.reason || '提交失败' });
          }
        } else {
          createMessage({
            type: 'warn',
            description: `结算日期已冻结至${
              res.response.datum.lastSettlementDate
            }，请选择此日期之后的时间进行结算`,
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
