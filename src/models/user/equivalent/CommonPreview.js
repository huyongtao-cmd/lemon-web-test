// import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { mul } from '@/utils/mathUtils';
import { getInfo, putCommonSC } from '@/services/user/equivalent/equivalent';
import { getViewConf } from '@/services/gen/flow';

const defaultFlowForm = {
  remark: undefined,
  salesmanResId: {},
  dirty: false,
};

export default {
  namespace: 'CommonPreview',
  state: {
    formData: {},
    fieldsConfig: {},
    flowForm: defaultFlowForm,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const formData = yield call(getInfo, { id: payload });
      if (formData.status === 200) {
        const infoData = formData.response.datum || {};

        const { eqvaSalary = null, applySettleEqva = null } = infoData;
        // const applySettleAmt = mul(applySettleEqva || 0, settlePrice);
        const resAmt = mul(applySettleEqva || 0, eqvaSalary || 0);

        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...infoData,
              // applySettleAmt,
              resAmt,
            },
          },
        });
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: defaultFlowForm,
          },
        });
      }
    },

    *putCommonSC({ payload }, { call, put }) {
      const { status, response } = yield call(putCommonSC, {
        procTaskId: payload.procTaskId,
        ...payload,
      });
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '审批成功' });
        return true;
      }
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      createMessage({ type: 'error', description: response.reason });
      return false;
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
    cleanFlow(state, { payload }) {
      return {
        ...state,
        fieldsConfig: {},
        flowForm: defaultFlowForm,
      };
    },
  },
};
