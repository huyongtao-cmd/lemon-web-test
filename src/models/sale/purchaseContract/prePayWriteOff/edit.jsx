/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable radix */
/* eslint-disable array-callback-return */
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
  getPaymentApplyWriteoffSelect,
  getPaymentWriteoffNoAndTypeDetail,
} from '@/services/sale/purchaseContract/paymentApplyList';

const setDefaultFormData = (defaultFormData, queryFormData) => {
  for (let k in defaultFormData) {
    for (let t in queryFormData) {
      if (k === t && queryFormData[t] === null) {
        queryFormData[t] = defaultFormData[k];
      }
    }
  }
  return { ...defaultFormData, ...queryFormData };
};

export default {
  namespace: 'prePayWriteOffEdit',
  state: {
    formData: {},
    defaultFormData: {},
    invoiceVerDetail: [], // 发票核销明细
    payDetailList: [], // 付款明细
    bearDepList: [], // 部门费用承担
    invoicesList: [],
    payRecordList: [], // 付款记录
    docNoList: [], // 单据号列表
    pageConfig: {},
  },
  effects: {
    *query({ payload }, { call, put, all, select }) {
      // 清除缓存数据
      yield put({
        type: 'cleanState',
      });
      const { mode, resId, preId, id } = payload;
      const { defaultFormData } = yield select(({ prePayWriteOffEdit }) => prePayWriteOffEdit);
      // 选择需要的默认值 创建时进行赋值
      const { payDate, expHexiaoDate, applicationDate, purchaseInchargeResId } = defaultFormData;
      yield put({
        type: 'getPaymentApplyOpportunity',
      });
      if (mode === 'create') {
        const { status, response } = yield call(getPaymentApplyById, preId);
        if (status === 200) {
          const { datum } = response;
          let newFormData = setDefaultFormData(defaultFormData, datum.twPaymentApplyEntity);
          yield put({
            type: 'initFieldSourcing',
            payload: {
              formData: newFormData,
              mode,
            },
          });

          yield put({
            type: 'updateForm',
            payload: {
              ...newFormData,
              payDate,
              expHexiaoDate,
              applicationDate,
              purchaseInchargeResId,
              paymentApplicationType: 'ADVANCEPAYWRITEOFF',
              id: '',
              paymentNo: '',
              prePaymentNo: datum.twPaymentApplyEntity.paymentNo,
              paymentAmt: datum.twPaymentApplyEntity.currPaymentAmt,
              currPaymentAmt: 0,
              taxAmountAmt: sub(0, datum.twPaymentApplyEntity.taxAmount || 0),
            },
          });
        }
      } else {
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
          yield put({
            type: 'initFieldSourcing',
            payload: {
              formData: datum.twPaymentApplyEntity,
              mode,
            },
          });
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...datum.twPaymentApplyEntity,
                depAmt: BearTotal,
                taxAmountAmt: sub(
                  datum.twPaymentApplyEntity.currPaymentAmt || 0,
                  datum.twPaymentApplyEntity.taxAmount || 0
                ),
                restAmt: sub(
                  sub(
                    datum.twPaymentApplyEntity.currPaymentAmt || 0,
                    datum.twPaymentApplyEntity.taxAmount || 0
                  ),
                  BearTotal
                ),
              },
              payDetailList: datum.twPurchasePaymentPlanEntities || [],
              payRecordList: datum.twPaymentSlipEntities || [],
              invoiceVerDetail: datum.twInvoiceVerDetailEntities || [],
              bearDepList: datum.twCostUndertakeDeptEntities || [],
            },
          });
        }
      }
    },

    // 初始化联动字段
    *initFieldSourcing({ payload }, { call, select, put, all }) {
      const { formData, mode } = payload;
      // 根据供应商+合同类型,初始化关联合同号下拉框选项，根据关联合同类型+关联合同号,初始化付款明细
      if (formData.docType && formData.supplierLegalNo && formData.docNo && mode === 'create') {
        yield put({
          type: 'getDocNoDetailBydocType',
          payload: {
            supplierLegalNo: formData.supplierLegalNo,
            docType: formData.docType,
            docNo: formData.docNo,
          },
        });
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
            docNoList: [], // 清空单据列表
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
        ({ prePayWriteOffEdit }) => prePayWriteOffEdit
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
            payDetailList: [],
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

    // 同时联动单据类型+单据号，带出单据详情
    *getDocNoDetailBydocType({ payload }, { call, select, put, all }) {
      const { docType, supplierLegalNo, docNo } = payload;
      const rsp1 = yield call(getPaymentApplyWriteoffSelect, docType, supplierLegalNo);

      const response1 = rsp1.response;
      const rsp2 = yield call(getPaymentWriteoffNoAndTypeDetail, docNo, docType);

      const response2 = rsp2.response;
      if (response1.ok && response2.ok) {
        const datum1 = response1.datum;
        const datum2 = response2.datum;
        yield put({
          type: 'updateForm',
          payload: {
            relatedSalesContract: datum2.twPaymentApplyEntity.relatedSalesContract,
            relatedProjectNo: datum2.twPaymentApplyEntity.relatedProjectNo,
            currPaymentAmt: datum2.twPaymentApplyEntity.currPaymentAmt || 0,
          },
        });
        yield put({
          type: 'updateState',
          payload: {
            docNoList: datum1,
            payDetailList: datum2.twPurchasePaymentPlanEntities || [],
          },
        });
      } else {
        createMessage({ type: 'success', description: '关联单据号或关联单据号详情获取失败' });
      }
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    cleanState(state, action) {
      return {
        ...state,
        formData: {},
        invoiceVerDetail: [], // 发票核销明细
        payDetailList: [], // 付款明细
        bearDepList: [], // 部门费用承担
        invoicesList: [],
        docNoList: [], // 单据号列表
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
