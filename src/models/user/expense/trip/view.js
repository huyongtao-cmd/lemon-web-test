import {
  findExpenseById,
  saveExpense,
  updateAdjustedAmt,
  getMealFeeRq,
  updateProblemType,
  selectRoleCodeByResIdRq,
} from '@/services/user/expense/expense';
import { doApprove, doReject } from '@/services/user/expense/flow';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf, pushFlowTask } from '@/services/gen/flow';
import { closeThenGoto, closeTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { clone } from 'ramda';

export default {
  namespace: 'userExpenseTripView',
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
    feeCodeList: [],
    visible: false,
    modalParmas: {},
    mealMoenyList: [],
  },

  effects: {
    *getResRoles({ payload }, { call, put }) {
      const { status, response } = yield call(selectRoleCodeByResIdRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200 && response.ok) {
        yield put({
          type: 'updateForm',
          payload: {
            roles: Array.isArray(response.datum) ? response.datum : [],
          },
        });
        return response;
      }

      createMessage({ type: 'error', description: response.reason || '获取报销人角色失败' });
      return {};
    },
    *getMealFee({ payload }, { call, put, select }) {
      const { status, response } = yield call(getMealFeeRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        const { modalParmas, detailList } = yield select(
          ({ userExpenseTripView }) => userExpenseTripView
        );
        const { index } = modalParmas;
        const { tripMealsDayList } = detailList[index];

        const {
          datum: { feeAmt },
        } = response;
        yield put({
          type: 'updateState',
          payload: {
            modalParmas: {
              ...modalParmas,
              feeAmt,
            },
            mealMoenyList: clone(tripMealsDayList),
          },
        });
        return response;
      }
      return {};
    },
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {},
          detailList: [],
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
      if (status === 200) {
        const { datum = {} } = response;
        yield put({
          type: 'updateState',
          payload: {
            formData:
              {
                ...datum,
                busitripApplyName: datum.applyView && datum.applyView.applyName,
              } || {},
            detailList: Array.isArray(datum.reimdList) ? datum.reimdList : [],
          },
        });
        yield put({
          type: 'getResRoles',
          payload: {
            resId: datum.reimResId,
          },
        });
        return response;
      }
      if (status === 100) {
        // 主动取消请求
        return 0;
      }
      createMessage({ type: 'error', description: response.reason });
      return 0;
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
        ({ userExpenseTripView }) => userExpenseTripView
      );
      detailList[0].remark = formData.remark;
      const { response } = yield call(updateAdjustedAmt, formData.id, detailList);
      if (response.ok) {
        yield put({ type: 'approve', payload: { taskId, remark } });
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return false;
    },

    *approveWithNoBranch({ payload }, { call, select }) {
      const { formData, detailList } = yield select(
        ({ userExpenseTripView }) => userExpenseTripView
      );
      // 明细列表
      formData.reimdList = detailList.map(r => ({
        ...r,
        id: typeof r.id === 'string' ? null : r.id,
      }));

      const { response } = yield call(saveExpense, { ...formData, submitted: false });
      if (response.ok) {
        // 审批流程
        const { status } = yield call(pushFlowTask, payload.taskId, {
          result: 'APPROVED',
          remark: payload.remark,
        });
        if (status === 200) {
          createMessage({ type: 'success', description: '操作成功' });
          const { from } = fromQs();
          const url = getUrl(from);
          url ? closeThenGoto(url) : closeTab();
          closeThenGoto(`/user/flow/process`);
        } else if (status === 100) {
          // 主动取消请求
          return false;
        } else {
          createMessage({ type: 'error', description: '操作失败' });
        }
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return false;
    },

    // 更新问题类型
    *updateProblemType({ payload }, { call, select, put }) {
      const { formData } = yield select(({ userExpenseTripView }) => userExpenseTripView);
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
};
