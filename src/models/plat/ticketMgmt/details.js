import { getTicketMgmtDetails, submitApply } from '@/services/plat/ticketMgmt';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'ticketMgmtDetails',
  state: {
    formData: {},
    detail: {},
    tableData: [],
  },

  effects: {
    *getDetails({ payload }, { call, put }) {
      const { status, response } = yield call(getTicketMgmtDetails, payload);
      if (status === 200) {
        if (response && response.ok) {
          const tableData = Array.isArray(response.datum) ? response.datum : [];
          const detail = tableData[0] || {};
          const firstData = detail.accountList[0] || {};
          yield put({
            type: 'updateDetails',
            payload: {
              tableData,
              detail,
              formData: {
                abAccId: firstData.id,
                bankName: firstData.bankName,
                holderName: firstData.holderName,
                bankBranch: firstData.bankBranch,
                remark: detail.remark,
                ids: payload,
                payMethod: detail.payMethod,
              },
            },
          });
        } else {
          const message = response.reason || '初始化报销记录失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *submit({ payload }, { call, put }) {
      const { ids, payMethod, abAccId, remark } = payload;
      const params = { ids, payMethod, abAccId, remark };
      const { status, response } = yield call(submitApply, params);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/plat/adminMgmt/TicketMgmt`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
  },

  reducers: {
    updateDetails(state, { payload }) {
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
