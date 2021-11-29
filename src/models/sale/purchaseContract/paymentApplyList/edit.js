/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
/* eslint-disable array-callback-return */
import { isEmpty } from 'ramda';
import { add as mathAdd, sub, mul } from '@/utils/mathUtils';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { closeThenGoto } from '@/layouts/routerControl';

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
  getPaymentApplyCalcAmt,
  getPaymentApplyByDocNoScene,
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
  namespace: 'paymentApplyEdit',
  state: {
    formData: {},
    defaultFormData: {},
    pageConfig: {},
    opportunityList: [], // 商机列表
    invoiceVerDetail: [], // 发票明细
    payDetailList: [], // 付款明细
    bearDepList: [], // 部门费用承担
    cashOutList: [], // 提现申请
    payRecordList: [], // 付款记录
  },
  effects: {
    *query({ payload }, { call, put, all, select }) {
      yield put({
        type: 'cleanState',
      });
      const { defaultFormData, formData } = yield select(
        ({ paymentApplyEdit }) => paymentApplyEdit
      );
      const {
        payDate,
        expHexiaoDate,
        applicationDate,
        purchaseInchargeResId,
        acceptanceType,
        invoiceState,
      } = defaultFormData;

      yield put({
        type: 'getPaymentApplyOpportunity',
      });
      const { mode, id, docNo, scene } = payload;
      if (mode === 'create') {
        const { status, response } = yield call(getPaymentApplyByDocNoScene, docNo, scene);
        if (response.ok) {
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
          // 提现金额
          let withdrawTotal = 0;
          if (Array.isArray(datum.twWithdrawEntities) && datum.twWithdrawEntities.length !== 0) {
            datum.twWithdrawEntities.map((item, index) => {
              withdrawTotal = mathAdd(withdrawTotal, item.amt);
            });
          }
          if (
            datum.twPaymentApplyEntity &&
            datum.twPaymentApplyEntity.docType === 'AGREEMENT' &&
            scene &&
            parseInt(scene, 10) !== 16
          ) {
            yield put({
              type: 'getPaymentApplyCalcAmt',
              payload: {
                agreementNo: docNo,
                amt: withdrawTotal,
              },
            });
          }
          // 判断是否有收款人(申请人填写)
          if (datum.twPaymentApplyEntity && datum.twPaymentApplyEntity.receivingUnit) {
            yield put({
              type: 'selectAccountByNo',
              payload: {
                receivingUnit: datum.twPaymentApplyEntity.receivingUnit,
              },
            });
          }

          // 初始化赋值
          let newFormData = setDefaultFormData(defaultFormData, datum.twPaymentApplyEntity);
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...formData,
                ...newFormData,
                payDate,
                expHexiaoDate,
                applicationDate,
                purchaseInchargeResId,
                id: '',
                paymentNo: '',
                depAmt: BearTotal || 0,
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
                withdrawTotal, // 提现金额合计
              },
              payDetailList: datum.twPurchasePaymentPlanEntities || [],
              invoiceVerDetail: datum.twInvoiceVerDetailEntities || [],
              bearDepList: datum.twCostUndertakeDeptEntities || [],
              cashOutList: datum.twWithdrawEntities || [],
              payRecordList: datum.twPaymentSlipEntities || [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询失败' });
        }
      } else {
        const { status, response } = yield call(getPaymentApplyById, id);
        if (status === 200) {
          const { datum } = response;
          if (datum.twPaymentApplyEntity.finalPaymentCompany1) {
            yield put({
              type: 'selectFinalAccountByNo',
              payload: {
                finalPaymentCompany1: datum.twPaymentApplyEntity.finalPaymentCompany1,
              },
            });
          }
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
          // 提现申请
          let withdrawTotal = 0;
          if (Array.isArray(datum.twWithdrawEntities) && datum.twWithdrawEntities.length !== 0) {
            datum.twWithdrawEntities.map((item, index) => {
              withdrawTotal = mathAdd(withdrawTotal, item.amt);
            });
          }
          if (
            datum.twPaymentApplyEntity &&
            datum.twPaymentApplyEntity.docType === 'AGREEMENT' &&
            scene &&
            parseInt(scene, 10) !== 16
          ) {
            yield put({
              type: 'getPaymentApplyCalcAmt',
              payload: {
                agreementNo: datum.twPaymentApplyEntity.docNo,
                amt: withdrawTotal,
              },
            });
          }
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...formData,
                ...datum.twPaymentApplyEntity,
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
                depAmt: BearTotal || 0,
                withdrawTotal, // 提现金额合计
              },
              payDetailList: datum.twPurchasePaymentPlanEntities || [],
              invoiceVerDetail: datum.twInvoiceVerDetailEntities || [],
              bearDepList: datum.twCostUndertakeDeptEntities || [],
              cashOutList: datum.twWithdrawEntities || [],
              payRecordList: datum.twPaymentSlipEntities || [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询失败' });
        }
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
      let receivingBank = '';
      if (response.ok) {
        receivingBank = response.datum;
        yield put({
          type: 'updateForm',
          payload: {
            receivingBank: response.datum,
          },
        });
      }
      return receivingBank;
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
      const { formData, payDetailList, invoiceVerDetail, bearDepList, cashOutList } = yield select(
        ({ paymentApplyEdit }) => paymentApplyEdit
      );
      const { scene } = payload;
      let id = '';
      if (formData.id) {
        const { status, response } = yield call(postPrePaymentApplyUpdate, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
          twInvoiceVerDetailEntities: invoiceVerDetail,
          twCostUndertakeDeptEntities: bearDepList,
          twWithdrawEntities: cashOutList,
        });
        if (response.ok) {
          id = response.datum;
        } else {
          createMessage({ type: 'error', description: response.reason || '更新失败' });
        }
      } else {
        const { status, response } = yield call(postPrePaymentApplySave, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
          twInvoiceVerDetailEntities: invoiceVerDetail,
          twCostUndertakeDeptEntities: bearDepList,
          twWithdrawEntities: cashOutList,
        });
        if (response.ok) {
          id = response.datum;
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      }
      return id;
    },

    // 提交
    *submit({ payload }, { call, select, put, all }) {
      const { status, response } = yield call(postPaymentApplyFlowSubmit, payload.id);
      return response;
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

    // 付款银行卡号(财务填写)
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

    // 根据前置单据号获取费率
    *getPaymentApplyCalcAmt({ payload }, { call, put, select }) {
      const { agreementNo, amt } = payload;
      const { status, response } = yield call(getPaymentApplyCalcAmt, agreementNo, amt);
      if (response.ok) {
        yield put({
          type: 'updateForm',
          payload: {
            feeRate: response.datum / 100,
            amtRateTotal: mul(amt, response.datum / 100 || 0),
            paymentAmt: mul(amt, response.datum / 100 || 0),
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取费率失败' });
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
        opportunityList: [], // 商机列表
        invoiceVerDetail: [], // 发票明细
        payDetailList: [], // 付款明细
        bearDepList: [], // 部门费用承担
        cashOutList: [], // 提现申请
        payRecordList: [], // 付款记录
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
