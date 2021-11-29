/* eslint-disable no-restricted-syntax */
/* eslint-disable array-callback-return */
/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
import { isEmpty } from 'ramda';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { closeThenGoto } from '@/layouts/routerControl';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';
import {
  getPaymentApplyById,
  postPrePaymentApplySave,
  postPrePaymentApplyUpdate,
  postPaymentApplyFlowSubmit,
  selectAccountByNo,
  selectApplyAccounts,
  getInvoicesDetail,
  getPaymentApplyInvoices,
  getPaymentApplyOpportunity,
  getPaymentApplyTempds,
  postPaymentSlipSave,
  postPaymentSlipFlowSubmit,
  getPaymentApplyWriteoffSelect,
  getPaymentWriteoffNoAndTypeDetail,
  getPaymentSlipListById,
  postPaymentAppFirstFlowSubmit,
} from '@/services/sale/purchaseContract/paymentApplyList';

export default {
  namespace: 'prePayWriteOffDetail',
  state: {
    formData: {},
    defaultFormData: {},
    invoiceVerDetail: [], // 发票核销明细
    payDetailList: [], // 付款明细
    bearDepList: [], // 部门费用承担
    payRecordList: [], // 付款记录
    invoicesList: [],
    pageConfig: {},
    fieldsConfig: {
      taskKey: '',
      panels: [],
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
  },
  effects: {
    *query({ payload }, { call, put, all, select }) {
      const { id } = payload;
      yield put({
        type: 'getPaymentApplyOpportunity',
      });
      const { status, response } = yield call(getPaymentApplyById, id);
      if (status === 200) {
        const { datum } = response;
        // 分摊汇总
        let BearTotal = 0;
        // 费用承担部门
        if (datum.twCostUndertakeDeptEntities) {
          const newBearDepList = datum.twCostUndertakeDeptEntities;
          if (newBearDepList.length !== 0) {
            newBearDepList.map((item, index) => {
              BearTotal = mathAdd(BearTotal, item.paymentAmt || 0);
            });
          }
        }
        if (datum.twPaymentApplyEntity.receivingUnit) {
          yield put({
            type: 'selectAccountByNo',
            payload: {
              receivingUnit: datum.twPaymentApplyEntity.receivingUnit,
            },
          });
        }
        if (datum.twPaymentApplyEntity.finalPaymentCompany1) {
          yield put({
            type: 'selectFinalAccountByNo',
            payload: {
              finalPaymentCompany1: datum.twPaymentApplyEntity.finalPaymentCompany1,
            },
          });
        }
        // 如果 供应商和关联单据类型存在时 需要带出单据号列表
        if (
          datum.twPaymentApplyEntity.docType !== '' &&
          datum.twPaymentApplyEntity.supplierLegalNo !== ''
        ) {
          yield put({
            type: 'docTypeSelect',
            payload: {
              docType: datum.twPaymentApplyEntity.docType,
              supplierLegalNo: datum.twPaymentApplyEntity.supplierLegalNo,
            },
          });
        }
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...datum.twPaymentApplyEntity,
              taxAmountAmt: sub(
                datum.twPaymentApplyEntity.currPaymentAmt || 0,
                datum.twPaymentApplyEntity.taxAmount || 0
              ),
              depAmt: BearTotal,
              restAmt: sub(
                sub(
                  datum.twPaymentApplyEntity.currPaymentAmt || 0,
                  datum.twPaymentApplyEntity.taxAmount || 0
                ),
                BearTotal
              ),
            },
            payDetailList: datum.twPurchasePaymentPlanEntities || [],
            invoiceVerDetail: datum.twInvoiceVerDetailEntities || [],
            bearDepList: datum.twCostUndertakeDeptEntities || [],
            payRecordList: datum.twPaymentSlipEntities || [],
          },
        });
      }
    },

    // 退回到第一个节点提交
    *reSubmit({ payload }, { call, select, put, all }) {
      const { status, response } = yield call(postPaymentAppFirstFlowSubmit, payload);
      return response;
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

    // 银行账号名称(付款申请用)
    *tableAccounts({ payload }, { call, select, put, all }) {
      const { accountNo } = payload;
      const { status, response } = yield call(selectApplyAccounts, accountNo);
      return response.datum;
    },

    // 获取科目模版
    *getPaymentApplyTempds({ payload }, { call, select, put, all }) {
      const { status, response } = yield call(getPaymentApplyTempds, 20001);
      if (response.ok) return response.datum;
      return [];
    },

    // 获取发票详情
    *InvoicesDetail({ payload }, { call, select, put, all }) {
      const { invoiceNo } = payload;
      const { status, response } = yield call(getInvoicesDetail, invoiceNo);
      if (response.ok) return response.datum;
      return [];
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

    // 获取工作流
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: { taskKey: '', ...response } || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { resId, mode } = payload;
      const { status, response } = yield call(businessPageDetailByNo, payload);
      let defaultFormData = {};
      if (status === 200) {
        const { configInfo } = response;
        const overViewConfig = configInfo.pageBlockViews.filter(
          item => item.blockKey === 'OVERVIEW'
        )[0];
        const baseInfoConfig = configInfo.pageBlockViews.filter(
          item => item.blockKey === 'BASE_INFO'
        )[0];
        const relateDocConfig = configInfo.pageBlockViews.filter(
          item => item.blockKey === 'RELATE_DOC'
        )[0];
        const financeConfig = configInfo.pageBlockViews.filter(
          item => item.blockKey === 'FINANCE'
        )[0];
        const accountConfig = configInfo.pageBlockViews.filter(
          item => item.blockKey === 'ACCOUNT'
        )[0];
        const { pageFieldViews: overViewPageField } = overViewConfig;
        const { pageFieldViews: baseInfoPageField } = baseInfoConfig;
        const { pageFieldViews: relateDocPageField } = relateDocConfig;
        const { pageFieldViews: financePageField } = financeConfig;
        const { pageFieldViews: accountPageField } = accountConfig;
        overViewPageField.forEach(field => {
          defaultFormData[field.fieldKey] = field.fieldDefaultValue;
        });
        baseInfoPageField.forEach(field => {
          defaultFormData[field.fieldKey] = field.fieldDefaultValue;
        });
        relateDocPageField.forEach(field => {
          defaultFormData[field.fieldKey] = field.fieldDefaultValue;
        });
        financePageField.forEach(field => {
          defaultFormData[field.fieldKey] = field.fieldDefaultValue;
        });
        accountPageField.forEach(field => {
          defaultFormData[field.fieldKey] = field.fieldDefaultValue;
        });
        defaultFormData.payDate = formatDT(moment());
        defaultFormData.expHexiaoDate = formatDT(moment());
        defaultFormData.applicationDate = formatDT(moment());
        defaultFormData.purchaseInchargeResId = resId;
        for (let key in defaultFormData) {
          if (defaultFormData[key] === null) {
            delete defaultFormData[key];
          }
        }
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: configInfo,
            defaultFormData,
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取页面配置失败' });
      }
      return {};
    },
    // 保存
    *save({ payload }, { call, select, put, all }) {
      const { formData, payDetailList, invoiceVerDetail, bearDepList } = yield select(
        ({ prePayWriteOffDetail }) => prePayWriteOffDetail
      );
      const { scene } = payload;
      let id = '';
      if (formData.id) {
        const { status, response } = yield call(postPrePaymentApplyUpdate, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
          twInvoiceVerDetailEntities: invoiceVerDetail,
          twCostUndertakeDeptEntities: bearDepList,
        });
        if (response.ok) {
          id = response.datum;
        }
      } else {
        const { status, response } = yield call(postPrePaymentApplySave, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
          twInvoiceVerDetailEntities: invoiceVerDetail,
          twCostUndertakeDeptEntities: bearDepList,
        });
        if (response.ok) {
          id = response.datum;
        }
      }
      return id;
    },

    // 提交
    *submit({ payload }, { call, select, put, all }) {
      const { status, response } = yield call(postPaymentApplyFlowSubmit, payload.id);
      return response;
    },

    // 根据付款申请单ID获取付款单记录列表
    *getPaymentSlipListById({ payload }, { call, select, put, all }) {
      const { formData } = yield select(({ prePayWriteOffDetail }) => prePayWriteOffDetail);
      const { status, response } = yield call(getPaymentSlipListById, formData.id);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            payRecordList: response.datum,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取记录单信息失败' });
      }
    },

    // 付款记录保存
    *payRecordSave({ payload }, { call, select, put, all }) {
      const { newPayRecordList } = payload;
      const { status, response } = yield call(postPaymentSlipSave, newPayRecordList[0]);
      let id = '';
      if (response.ok) {
        id = response.datum;
      }
      return id;
    },
    // 付款记录提交
    *payRecordSubmit({ payload }, { call, select, put, all }) {
      const { id } = payload;
      const { status, response } = yield call(postPaymentSlipFlowSubmit, id);
      if (response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        yield put({
          type: 'getPaymentSlipListById',
        });
      }
    },

    // 付款银行卡号
    *selectFinalAccountByNo({ payload }, { call, select, put, all }) {
      const { finalPaymentCompany1 } = payload;
      const { status, response } = yield call(selectAccountByNo, finalPaymentCompany1);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            finalPaymentIdList: response.datum,
          },
        });
      }
    },
    // 付款银行账号名称
    *selectFinalApplyAccounts({ payload }, { call, select, put, all }) {
      const { finalPaymentId } = payload;
      const { status, response } = yield call(selectApplyAccounts, finalPaymentId);
      if (response.ok) {
        yield put({
          type: 'updateForm',
          payload: {
            finalPaymentBank: response.datum,
          },
        });
      }
    },

    // 关联单据号
    *docTypeSelect({ payload }, { call, select, put, all }) {
      const { docType, supplierLegalNo } = payload;
      const { status, response } = yield call(
        getPaymentApplyWriteoffSelect,
        docType,
        supplierLegalNo
      );
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            docNoList: response.datum,
          },
        });
      } else {
        createMessage({ type: 'success', description: '关联单据号获取失败' });
      }
    },

    // 关联单据号详情
    *getDocNoDetail({ payload }, { call, select, put, all }) {
      const { docType, docNo } = payload;
      const { status, response } = yield call(getPaymentWriteoffNoAndTypeDetail, docNo, docType);
      if (response.ok) {
        const { datum } = response;
        yield put({
          type: 'updateForm',
          payload: {
            relatedSalesContract: datum.twPaymentApplyEntity.relatedSalesContract,
            relatedProjectNo: datum.twPaymentApplyEntity.relatedProjectNo,
            paymentAmt: datum.twPaymentApplyEntity.paymentAmt || 0,
            currPaymentAmt: datum.twPaymentApplyEntity.currPaymentAmt || 0,
          },
        });
        yield put({
          type: 'updateState',
          payload: {
            payDetailList: datum.twPurchasePaymentPlanEntities || [],
          },
        });
      } else {
        createMessage({ type: 'success', description: '关联单据号详情获取失败' });
      }
      return response;
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
