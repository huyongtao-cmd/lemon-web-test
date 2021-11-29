/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
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
  getPurchaseByDoc,
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

// 从一个对象取部分属性给另一个对象
const pick = (obj, arr) =>
  arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {});

export default {
  namespace: 'prePaymentApplyEdit',
  state: {
    formData: {},
    defaultFormData: {}, // 默认值
    pageConfig: {},
    opportunityList: [],
    payDetailList: [],
    bearDepList: [], // 费用承担部门
    payRecordList: [], // 付款记录
    invoiceVerDetail: [], // 发票核销金额
  },
  effects: {
    *query({ payload }, { call, put, all, select }) {
      const { defaultFormData, formData } = yield select(
        ({ prePaymentApplyEdit }) => prePaymentApplyEdit
      );
      yield put({
        type: 'cleanState',
      });
      yield put({
        type: 'getPaymentApplyOpportunity',
      });
      const { mode, id, docNo, scene } = payload;
      if (mode === 'create') {
        if (docNo === undefined) {
          yield put({
            type: 'updateState',
            payload: {
              formData: { ...defaultFormData, currPaymentAmt: 0 },
              payDetailList: [],
              payRecordList: [],
              bearDepList: [],
              invoiceVerDetail: [],
            },
          });
        } else {
          if (scene === '3') {
            const { status, response } = yield call(getPaymentApplyByDocNoScene, docNo, scene);
            if (response.ok) {
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
                type: 'updateState',
                payload: {
                  formData: {
                    ...formData,
                    ...newFormData,
                    id: '',
                    paymentNo: '',
                  },
                  payDetailList: datum.twPurchasePaymentPlanEntities || [],
                  invoiceVerDetail: datum.twInvoiceVerDetailEntities || [],
                  bearDepList: datum.twCostUndertakeDeptEntities || [],
                  cashOutList: datum.twWithdrawEntities || [],
                  payRecordList: datum.twPaymentSlipEntities || [],
                },
              });
            } else {
              createMessage({
                type: 'error',
                description: response.reason || '获取商机预付款申请失败',
              });
            }
          }
          if (scene === '14') {
            const { status, response } = yield call(getPurchaseByDoc, docNo);
            if (response) {
              const purchaseData = pick(response, [
                'paymentCompany1',
                'supplierLegalNo',
                'paymentAmt',
                'currCode',
                'docType',
                'docNo',
                'relatedSalesContract',
                'relatedProjectNo',
                'payMethod',
                'receivingUnit',
                'receivingId',
                'receivingBank',
              ]);
              let newFormData = setDefaultFormData(defaultFormData, purchaseData);
              yield put({
                type: 'initFieldSourcing',
                payload: {
                  formData: newFormData,
                  mode,
                },
              });
              yield put({
                type: 'updateState',
                payload: {
                  formData: {
                    ...formData,
                    ...newFormData,
                    id: '',
                    paymentNo: '',
                  },
                  payDetailList: [],
                  invoiceVerDetail: [],
                  bearDepList: [],
                  cashOutList: [],
                  payRecordList: [],
                },
              });
            } else {
              createMessage({
                type: 'error',
                description: '获取采购合同预付款申请失败',
              });
            }
          }
        }
      } else {
        const { status, response } = yield call(getPaymentApplyById, id);
        if (status === 200) {
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
                },
                payDetailList: datum.twPurchasePaymentPlanEntities || [],
                payRecordList: datum.twPaymentSlipEntities || [],
                bearDepList: datum.twCostUndertakeDeptEntities || [],
                invoiceVerDetail: datum.twInvoiceVerDetailEntities || [],
              },
            });
          } else {
            createMessage({ type: 'error', description: response.reason || '查询失败' });
          }
        }
      }
    },

    // 初始化联动字段
    *initFieldSourcing({ payload }, { call, select, put, all }) {
      const { formData, mode } = payload;
      if (formData.finalPaymentCompany1) {
        yield put({
          type: 'selectFinalAccountByNo',
          payload: {
            finalPaymentCompany1: formData.finalPaymentCompany1,
          },
        });
      }
      if (formData.receivingUnit) {
        yield put({
          type: 'selectAccountByNo',
          payload: {
            receivingUnit: formData.receivingUnit,
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
    // 付款银行账号名称（财务填写）
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
      const { formData, payDetailList, bearDepList } = yield select(
        ({ prePaymentApplyEdit }) => prePaymentApplyEdit
      );
      const { scene } = payload;
      let id = '';
      if (formData.id) {
        const { status, response } = yield call(postPrePaymentApplyUpdate, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
          twCostUndertakeDeptEntities: bearDepList,
        });
        if (response.ok) {
          id = response.datum;
        }
      } else {
        const { status, response } = yield call(postPrePaymentApplySave, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
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
        bearDepList: [], // 费用承担部门
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
