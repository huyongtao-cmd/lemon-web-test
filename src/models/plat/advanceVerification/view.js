import {
  createTrip,
  findExpenseById,
  queryExpenses,
  saveExpense,
  updateAdjustedAmt,
} from '@/services/user/expense/expense';
import { queryAdvanceVerificationDetail, saveData } from '@/services/plat/advanceVerification';
import { doApprove, doReject } from '@/services/user/expense/flow';
import createMessage from '@/components/core/AlertMessage';
import { queryUserPrincipal } from '@/services/gen/user';
import { getViewConf } from '@/services/gen/flow';
import { closeThenGoto, closeTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { isEmpty, isNil, takeWhile, trim } from 'ramda';

export default {
  namespace: 'advanceVerificationView',

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
    newDetailList: [], // 原始明细
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
      const { status, response } = yield call(queryAdvanceVerificationDetail, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok && response.datum) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...response.datum,
              applyResId: response.datum.applyResId ? Number(response.datum.applyResId) : undefined,
            },
            detailList: response.datum.reimdList,
            newDetailList: response.datum.reimdList,
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
    *save({ payload }, { call, put, select }) {
      const { formData, detailList, newDetailList } = yield select(
        ({ advanceVerificationView }) => advanceVerificationView
      );
      if (!detailList || (detailList && detailList.length < 1)) {
        createMessage({ type: 'warn', description: '费用明细至少需要一条数据' });
        return false;
      }
      // 明细列表
      let notSatisfied = false;
      takeWhile(item => {
        const judgment = isNil(item.accId) || isNil(item.reimDesc) || isEmpty(trim(item.reimDesc));
        if (judgment) {
          createMessage({ type: 'warn', description: '请补全表单必填项（带*的均为必填项）' });
          notSatisfied = true;
        }
        return !judgment;
      }, detailList);
      if (notSatisfied) return false;
      formData.reimdList = detailList.map(r => ({
        ...r,
        id: typeof r.id === 'string' ? null : r.id,
      }));
      if (formData.phaseDesc) {
        formData.phaseDesc = parseInt(formData.phaseDesc, 10);
      }
      formData.flow = payload;
      const deleteKeys = [];
      const list1 = formData.reimdList.map(item => item.id);
      const list2 = newDetailList.map(item => item.id);
      for (let i = 0; i < list2.length; i += 1) {
        if (!list1.includes(list2[i])) {
          deleteKeys.push(list2[i]);
        }
      }
      formData.deleteKeys = deleteKeys;
      const { status: sts, response } = yield call(saveData, formData);
      if (response && response.ok) {
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
        createMessage({ type: 'success', description: '提交成功', duration: 2 });
      } else {
        createMessage({ type: 'warn', description: response.reason || '提交失败', duration: 8 });
      }
      return true;
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
        ({ advanceVerificationView }) => advanceVerificationView
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
