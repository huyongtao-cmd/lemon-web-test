import { isEmpty } from 'ramda';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { closeThenGoto } from '@/layouts/routerControl';
import {
  linkagePurchaseSupplier,
  linkagePurchaseBu,
  queryPurchaseDetail,
  editPurchase,
  queryPlanList,
  payPlanPatchSave,
} from '@/services/user/Contract/sales';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

import {
  getPaymentApplyById,
  postPrePaymentApplySave,
  postPrePaymentApplyUpdate,
  postPaymentApplyFlowSubmit,
  selectAccountByNo,
  selectApplyAccounts,
  getPaymentApplyOpportunity,
  getInvoicesDetail,
  getPaymentApplyInvoices,
  getPaymentSlipDetailById, // 付款记录详情
} from '@/services/sale/purchaseContract/paymentApplyList';

const defaultFormData = {
  paymentNo: null,
  paymentApplicationType: 'ADVANCEPAY',
  applicationDate: formatDT(moment()),
  paymentCompanyName: null,
  paymentCompany1: null,
  supplierLegalNo: null,
  purchaseName: null,
  paymentAmt: null,
  currCode: 'CNY',
  purchaseInchargeResId: null,
  note: null,
  payDate: formatDT(moment()),
  expHexiaoDate: formatDT(moment()),
};
export default {
  namespace: 'payRecordEdit',
  state: {
    formData: defaultFormData,
    pageConfig: {},
    opportunityList: [],
    payRecordList: [],
  },
  effects: {
    *query({ payload }, { call, put, all }) {
      const { mode, resId, id } = payload;
      const { status, response } = yield call(getPaymentSlipDetailById, id);
      if (status === 200) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            payRecordList: [datum],
          },
        });
        // if (datum.twPaymentApplyEntity.supplierLegalNo) {
        //   const { supplierLegalNo } = datum.twPaymentApplyEntity;
        //   yield put({
        //     type: 'updateForm',
        //     payload: {
        //       receivingUnit: supplierLegalNo,
        //     },
        //   });
        //   yield put({
        //     type: 'selectAccountByNo',
        //     payload: {
        //       receivingUnit: supplierLegalNo,
        //     },
        //   });
        // }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },

    // 银行卡号
    *selectAccountByNo({ payload }, { call, select, put, all }) {
      const { receivingUnit } = payload;
      const { status, response } = yield call(selectAccountByNo, receivingUnit);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            receivingIdList: response.datum,
          },
        });
      }
    },
    // 银行账号名称
    *selectApplyAccounts({ payload }, { call, select, put, all }) {
      const { accountNo } = payload;
      const { status, response } = yield call(selectApplyAccounts, accountNo);
      if (response.ok) {
        yield put({
          type: 'updateForm',
          payload: {
            receivingBank: response.datum,
          },
        });
      }
    },
    // 商机
    *getPaymentApplyOpportunity({ payload }, { call, select, put, all }) {
      const { status, response } = yield call(getPaymentApplyOpportunity);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            opportunityList: response.datum,
          },
        });
      }
    },
    // 保存
    *save({ payload }, { call, select, put, all }) {
      const { formData, payDetailList } = yield select(({ payRecordEdit }) => payRecordEdit);
      const { scene } = payload;
      let id = '';
      if (formData.id) {
        const { status, response } = yield call(postPrePaymentApplyUpdate, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
        });
        if (response.ok) {
          id = response.datum;
          createMessage({ type: 'success', description: '更新成功' });
        }
      } else {
        const { status, response } = yield call(postPrePaymentApplySave, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
        });
        if (response.ok) {
          id = response.datum;
          createMessage({ type: 'success', description: '保存成功' });
        }
      }
      return id;
    },
    // 提交
    *submit({ payload }, { call, select, put, all }) {
      const { status, response } = yield call(postPaymentApplyFlowSubmit, payload.id);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: defaultFormData,
            opportunityList: [],
            payDetailList: [],
          },
        });
        createMessage({ type: 'success', description: '提交成功' });
      }
    },

    // 获取发票详情
    *InvoicesDetail({ payload }, { call, select, put, all }) {
      const { invoiceNo } = payload;
      const { status, response } = yield call(getInvoicesDetail, invoiceNo);
      if (response.ok) return response.datum;
      return [];
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
