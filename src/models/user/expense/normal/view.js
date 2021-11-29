import {
  createTrip,
  findExpenseById,
  queryExpenses,
  saveExpense,
  updateAdjustedAmt,
  updateProblemType,
} from '@/services/user/expense/expense';
import { doApprove, doReject } from '@/services/user/expense/flow';
import createMessage from '@/components/core/AlertMessage';
import { queryUserPrincipal } from '@/services/gen/user';
import { getViewConf } from '@/services/gen/flow';
import { closeThenGoto, closeTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';

export default {
  namespace: 'userExpenseNormalView',

  state: {
    formData: {},
    detailList: [], // 明细列表
    fieldsConfig: {
      panels: [],
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    phaseList: [],
    feeCodeList: [],
    reimTmpl: {},
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {},
          dataList: [],
          fieldsConfig: {
            panels: [],
          },
          flowForm: {
            remark: undefined,
            dirty: false,
          },
        },
      });
    },

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

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },

    *approve(
      {
        payload: { taskId, remark },
      },
      { call, put }
    ) {
      const { status, response } = yield call(doApprove, { taskId, remark });
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { from } = fromQs();
        const url = getUrl(from);
        url ? closeThenGoto(url) : closeTab();
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },

    *reject(
      {
        payload: { taskId, remark, branch },
      },
      { call, put }
    ) {
      const { status, response } = yield call(doReject, { taskId, remark, branch });
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { from } = fromQs();
        const url = getUrl(from);
        url ? closeThenGoto(url) : closeTab();
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },

    *updateAdjustedAmt(
      {
        payload: { taskId, remark },
      },
      { call, put, select }
    ) {
      const { formData, detailList } = yield select(
        ({ userExpenseNormalView }) => userExpenseNormalView
      );
      detailList[0].remark = formData.remark;
      const { status, response } = yield call(updateAdjustedAmt, formData.id, detailList);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        yield put({ type: 'approve', payload: { taskId, remark } });
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return false;
    },

    // 更新问题类型
    *updateProblemType({ payload }, { call, select, put }) {
      const { formData } = yield select(({ userExpenseNormalView }) => userExpenseNormalView);
      const { status, response } = yield call(updateProblemType, { ...formData });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (!response.ok) {
        createMessage({ type: 'error', description: response.reason || '更新失败' });
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
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
