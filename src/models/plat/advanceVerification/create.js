import {
  createNormal,
  findExpenseById,
  saveExpense,
  changeLeads,
} from '@/services/user/expense/expense';
import createMessage from '@/components/core/AlertMessage';
import { getPrePayDetail } from '@/services/user/center/prePay';
import { launchFlowFn } from '@/services/sys/flowHandle';
import { saveData } from '@/services/plat/advanceVerification';

import { queryUserPrincipal } from '@/services/gen/user';
import { pushFlowTask } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';
import { isEmpty, isNil, takeWhile, trim } from 'ramda';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'advanceVerificationCreate',
  state: {
    formData: {},
    detailList: [], // 明细列表
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
          detailList: [],
        },
      });
    },

    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(getPrePayDetail, payload);
      if (response && response.ok) {
        const {
          applyResId,
          applyNo,
          prepayType,
          adpayAmt,
          adpayHxDate,
          alreadyAmt,
          processState,
        } = response.datum;
        const formData = {
          prepayApplyNo: '系统自动生成',
          applyResId,
          applyNo,
          prepayType,
          adpayAmt,
          adpayHxDate,
          alreadyAmt,
          processState,
        };
        yield put({
          type: 'updateState',
          payload: {
            formData,
          },
        });
        return formData;
      }
      return {};
    },

    *changeLeadsStatus({ payload }, { call, put }) {
      const { status, response } = yield call(changeLeads, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          return;
        }
        createMessage({
          type: 'error',
          description: '报销单提交成功,领奖状态变更失败,请联系管理员!!!',
        });
      }
      createMessage({
        type: 'error',
        description: '报销单提交成功,领奖状态变更失败,请联系管理员!!!',
      });
    },

    *save({ payload }, { call, put, select }) {
      const { formData, detailList } = yield select(
        ({ advanceVerificationCreate }) => advanceVerificationCreate
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
      const { status: sts, response } = yield call(saveData, formData);
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'ACC_A60',
          value: {
            id: response.datum.id,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '申请提交成功' });
          closeThenGoto(`/plat/purchPay/advanceVerification/view?id=${response.datum.id}`);
        } else {
          createMessage({ type: 'warn', description: '申请提交失败' });
        }
      } else {
        createMessage({ type: 'warn', description: response.reason || '保存失败', duration: 8 });
      }
      return true;
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
};
