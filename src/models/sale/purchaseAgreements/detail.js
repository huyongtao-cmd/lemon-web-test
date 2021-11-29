import { closeThenGoto } from '@/layouts/routerControl';
import { queryDetail } from '@/services/sale/purchaseAgreement/purchaseAgreement';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'salePurchaseAgreementsDetail',
  state: {
    detailData: {
      agreementDetailsViews: [],
      agreementResViews: [],
      resSetRateViews: [],
      associationAgreementViews: [],
      agreementPaymentViews: [],
      agreementWithdrawViews: [],
    },
    fieldsConfig: {
      taskKey: '',
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    pageConfig: {},
    closeReason: '',
  },
  effects: {
    /* 获取采购合同详情 */
    *queryDetail({ payload }, { call, put, select }) {
      const { response } = yield call(queryDetail, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            detailData: response,
          },
        });
      }
    },

    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    clear(state, { payload }) {
      return {
        ...state,
        detailData: {
          contractDetailPurchaseView: {},
          projectPurchaseView: {},
          purchaseDetailsViews: [],
          purchasePaymentPlanViews: [],
        },
        fieldsConfig: {
          taskKey: '',
        },
        flowForm: {
          remark: undefined,
          dirty: false,
        },
        pageConfig: {},
        closeReason: '',
      };
    },
  },
};
