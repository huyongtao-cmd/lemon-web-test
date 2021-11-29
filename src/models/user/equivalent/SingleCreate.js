import {
  getInfo,
  getSingleTable,
  createEquivalent,
  startProc,
} from '@/services/user/equivalent/equivalent';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { mul, add } from '@/utils/mathUtils';

const UNFINISHED = 'NONE|IN PROCESS';

const whereToGo = () => {
  const { from } = fromQs();
  return from === 'originated' ? '/user/task/originated' : '/user/task/received';
};

export default {
  namespace: 'SingleCreate',
  state: {
    formData: {},
    list: [],
    total: undefined,
    tableStatus: UNFINISHED,
    selectedRowKeys: [],
  },
  effects: {
    *queryInfo({ payload }, { call, put, all }) {
      const { status, response } = yield call(getInfo, { taskId: payload });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
          },
        });
        yield put({
          type: 'queryTable',
          payload: { taskId: payload, formData: response.datum || {} },
        });
      }
    },
    *queryTable({ payload }, { call, put }) {
      const { taskId, formData = {} } = payload;
      const { status, response } = yield call(getSingleTable, { taskId });
      if (status === 200) {
        const list = Array.isArray(response.datum)
          ? response.datum.map(item => {
              const key = item.actNo + '_' + item.workHour + '_' + item.workDate;
              return { ...item, key };
            })
          : [];
        // 申请结算当量 = 各理论获得当量之和
        const applySettleEqva = list
          .filter(row => UNFINISHED.includes(row.settleStatus))
          .map(item => item.applySettleEqva)
          .reduce((sum, val) => add(sum || 0, val || 0), 0);
        // 金额 = 申请结算当量 * 结算单价
        const applySettleAmt = mul(applySettleEqva || 0, formData.settlePrice || 0);
        yield put({
          type: 'updateForm',
          payload: { applySettleAmt, applySettleEqva },
        });
        yield put({
          type: 'updateState',
          payload: {
            list,
            total: response.total,
            selectedRowKeys: list
              .filter(row => UNFINISHED.includes(row.settleStatus))
              .map(row => row.key),
          },
        });
      }
    },
    *saveData({ payload }, { call, put, select }) {
      const { status, response } = yield call(createEquivalent, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(whereToGo());
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },
    *submitData({ payload }, { call, put }) {
      const { status, response } = yield call(createEquivalent, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto(whereToGo());
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: response.reason || '提交失败' });
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
