import {
  queryExpenses,
  findExpenseById,
  saveExpense,
  updateAdjustedAmt,
} from '@/services/user/expense/expense';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';
import { doApproveSpec, doReject } from '@/services/user/expense/flow';
import { closeThenGoto, closeTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';

// 主表空数据
const emptyFormData = {};

export default {
  namespace: 'userExpenseSpecView',

  state: {
    formData: {
      ...emptyFormData,
    },
    detailList: [],
    feeCodeList: [],
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
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
            formData: response.datum || {},
            detailList: Array.isArray((response.datum || {}).reimdList)
              ? (response.datum || {}).reimdList
              : [],
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
      const { status, response } = yield call(doApproveSpec, { taskId, remark });
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
        ({ userExpenseSpecView }) => userExpenseSpecView
      );
      const { response } = yield call(updateAdjustedAmt, formData.id, detailList);
      if (response.ok) {
        yield put({ type: 'approve', payload: { taskId, remark } });
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return false;
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
