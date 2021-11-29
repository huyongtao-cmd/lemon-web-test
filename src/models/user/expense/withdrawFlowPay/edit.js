import {
  createTrip,
  findExpenseById,
  queryExpenses,
  saveExpense,
  updateAdjustedAmt,
  startWithdrawPay,
  modifyWithdrawPayFlow,
} from '@/services/user/expense/expense';
import { doApprove, doReject } from '@/services/user/expense/flow';
import createMessage from '@/components/core/AlertMessage';
import { queryUserPrincipal } from '@/services/gen/user';
import { getViewConf } from '@/services/gen/flow';
import { closeThenGoto, closeTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';

export default {
  namespace: 'withdrawPayFlowEdit',

  state: {
    formData: {},
    detailList: [], // 明细列表
    phaseList: [],
    feeCodeList: [],
    reimTmpl: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(findExpenseById, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum,
            detailList: response.datum.reimdList,
          },
        });
        return response.datum || {};
      }
      createMessage({ type: 'error', description: response.reason });
      return {};
    },

    *submit({ payload }, { call, put, select }) {
      const { status, response } = yield call(modifyWithdrawPayFlow, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '成功' });
        closeThenGoto('/plat/expense/withdrawPayFlowView?id=' + payload.id);
      } else {
        createMessage({ type: 'error', description: response.reason || '提交失败' });
      }
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {});
    },
  },
};
