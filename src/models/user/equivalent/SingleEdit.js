import { closeThenGoto } from '@/layouts/routerControl';
import {
  getInfo,
  getSingleTable,
  createEquivalent,
  startProc,
} from '@/services/user/equivalent/equivalent';
import { doTaskTaskApply } from '@/services/user/task/task';
import createMessage from '@/components/core/AlertMessage';
import { mul, add } from '@/utils/mathUtils';

const UNFINISHED = 'NONE|IN PROCESS';

export default {
  namespace: 'SingleEdit',
  state: {
    formData: {},
    list: [],
    total: undefined,
    tableStatus: UNFINISHED,
    selectedRowKeys: [],
  },
  effects: {
    *queryInfo({ payload }, { call, put, all }) {
      const { status, response } = yield call(getInfo, { id: payload });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
          },
        });
        yield put({ type: 'queryTable', payload });
      }
    },

    *queryTable({ payload }, { call, put, select }) {
      const { status, response } = yield call(getSingleTable, { id: payload });
      if (status === 200) {
        const list = Array.isArray(response.datum) ? response.datum : [];
        const { formData } = yield select(({ SingleEdit }) => SingleEdit);
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
              .map(row => row.id),
          },
        });
      }
    },
    *saveData({ payload }, { call, put, select }) {
      const { status, response } = yield call(createEquivalent, payload);

      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto('/plat/intelStl/list');
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },
    *submitData({ payload }, { call, put }) {
      const { formData, taskId, remark } = payload;
      const { status, response } = yield call(createEquivalent, formData);
      if (status === 200 && response.ok) {
        if (taskId) {
          const result = yield call(doTaskTaskApply, taskId, remark);
          if (result.status === 200 && !result.response.code) {
            createMessage({ type: 'success', description: '提交成功' });
            closeThenGoto('/plat/intelStl/list');
          } else {
            createMessage({ type: 'error', description: '提交失败' });
          }
          return;
        }
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/plat/intelStl/list');
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
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
