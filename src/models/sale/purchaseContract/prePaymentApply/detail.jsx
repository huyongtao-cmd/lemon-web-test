/* eslint-disable array-callback-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
import { isEmpty } from 'ramda';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { closeThenGoto } from '@/layouts/routerControl';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';

import {
  getPaymentApplyById,
  postPrePaymentApplySave,
  postPrePaymentApplyUpdate,
  postPaymentApplyFlowSubmit,
  selectAccountByNo,
  selectApplyAccounts,
  postPaymentSlipSave,
  postPaymentSlipFlowSubmit,
  getPaymentSlipListById,
  postPaymentAppFirstFlowSubmit,
  postPaymentSlipFlowBatchSubmit,
  postPaymentSlipBatchOperation,
} from '@/services/sale/purchaseContract/paymentApplyList';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'prePaymentApplyDetail',
  state: {
    formData: {},
    defaultFormData: {},
    payDetailList: [], // 付款明细
    payRecordList: [], // 付款记录
    bearDepList: [], // 费用承担部门
    invoiceVerDetail: [],
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
      const { status, response } = yield call(getPaymentApplyById, id);
      let scenes = '';
      if (status === 200) {
        if (response.ok) {
          const { datum } = response;
          scenes = datum.twPaymentApplyEntity.scene;

          console.info(scenes + '场景');
          if (datum.twPaymentApplyEntity.receivingUnit) {
            yield put({
              type: 'selectAccountByNo',
              payload: {
                receivingUnit: datum.twPaymentApplyEntity.receivingUnit,
              },
            });
          }
          // 如果有财务的收款公司带出账号
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

          // 申请单信息表单中收款公司带出财务的收款公司
          if (datum.twPaymentApplyEntity.paymentCompany1) {
            yield put({
              type: 'selectFinalAccountByNo',
              payload: {
                finalPaymentCompany1: datum.twPaymentApplyEntity.paymentCompany1,
              },
            });
          }
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...datum.twPaymentApplyEntity,
                finalPaymentCompany1:
                  datum.twPaymentApplyEntity.finalPaymentCompany1 !== '' &&
                  datum.twPaymentApplyEntity.finalPaymentCompany1 !== null
                    ? datum.twPaymentApplyEntity.finalPaymentCompany1
                    : datum.twPaymentApplyEntity.paymentCompany1,
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
      }
      return scenes;
    },

    // 保存
    *save({ payload }, { call, select, put, all }) {
      const { formData, payDetailList, payRecordList, bearDepList } = yield select(
        ({ prePaymentApplyDetail }) => prePaymentApplyDetail
      );
      const { scene } = payload;
      let id = '';
      if (formData.id) {
        const { status, response } = yield call(postPrePaymentApplyUpdate, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
          twPaymentSlipEntities: payRecordList || [],
          twCostUndertakeDeptEntities: bearDepList,
        });
        if (response.ok) {
          id = response.datum;
        }
      } else {
        const { status, response } = yield call(postPrePaymentApplySave, {
          twPaymentApplyEntity: { ...formData, scene },
          twPurchasePaymentPlanEntities: payDetailList,
          twPaymentSlipEntities: payRecordList || [],
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
      let finalPaymentBank = '';
      if (response.ok) {
        finalPaymentBank = response.datum;
        yield put({
          type: 'updateForm',
          payload: {
            finalPaymentBank: response.datum,
          },
        });
      }
      return finalPaymentBank;
    },
    // 获取工作流
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig:
              {
                taskKey: '',
                ...response,
              } || {},
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
    // 付款记录保存
    *payRecordSave({ payload }, { call, select, put, all }) {
      const { newPayRecordList } = payload;
      const { status, response } = yield call(postPaymentSlipSave, newPayRecordList[0]);
      let id = '';
      if (response.ok) {
        id = response.datum;
      } else {
        createMessage({ type: 'error', description: response.reason || '付款记录保存失败' });
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
          payload: {
            paymentApplyId: id,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '付款记录提交失败' });
      }
    },
    // 付款记录批量提交
    *paymentSlipBatchOperation({ payload }, { call, select, put, all }) {
      const { payRecordList } = yield select(({ prePaymentApplyDetail }) => prePaymentApplyDetail);
      const { status, response } = yield call(postPaymentSlipBatchOperation, payRecordList);
      return response;
    },

    // 银行账号名称(付款申请用)
    *tableAccounts({ payload }, { call, select, put, all }) {
      const { accountNo } = payload;
      const { status, response } = yield call(selectApplyAccounts, accountNo);
      return response.datum;
    },

    // 根据付款申请单ID获取付款单记录列表
    *getPaymentSlipListById({ payload }, { call, select, put, all }) {
      const { formData } = yield select(({ prePaymentApplyDetail }) => prePaymentApplyDetail);
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
