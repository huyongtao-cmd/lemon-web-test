// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import {
  purchaseCreate,
  purchaseDetail,
  purchaseOverallModify,
  purchaseCheck,
} from '@/services/production/pur';
import {
  accountSelectPaging,
  budgetSelectPaging,
  businessAccItemPaging,
} from '@/services/production/common/select';
import { customSelectionListByKey } from '@/services/production/system';
import { isNil, type } from 'ramda';
import update from 'immutability-helper';
import { getViewConf } from '@/services/gen/flow';
import { budgetItemListPaging, financialAccSubjListPaging } from '@/services/production/acc';

// 默认状态
const defaultState = {
  formData: {
    delPaymentPlanIds: [],
    delPurchaseOrderIds: [],
    purchaseOrderDetails: [],
    paymentPlanDetails: [],
    chargeClassification: '',
    originalCurrencyAmt: 0,
    baseCurrencyAmt: 0,
    exchangeRate: 1,
    foreignCurrencyFlag: false,
    originalCurrency: 'CNY',
    // expenseDocType: 'PURCHASE_ORDER',
    poClass1: 'STANDARD',
  },
  formMode: 'EDIT',
  copy: false,
  id: undefined,
  purTypeList: [],
  internalOuList: [],
  businessAccItemList: [],
  budgetList: [],
  financialAccSubjList: [],
  deleteOrderKeys: [],
  deletePaylanKeys: [],
  accountList: [],
  taskId: undefined,
  checked: false,
  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
  disableFlag: 'false',
  changeFlag: false,
  attachments: [],
};

export default {
  namespace: 'purchaseDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ purchaseDisplayPage }) => purchaseDisplayPage);
      if (!id) {
        return defaultState.formData;
      }
      const { data } = yield outputHandle(purchaseDetail, { id });
      const { foreignCurrencyFlag } = data;
      if (foreignCurrencyFlag) {
        data.foreignCurrencyFlagDesc = '是';
      } else {
        data.foreignCurrencyFlagDesc = '否';
      }
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      //临时采购支付信息没有返现
      const { requestDetail = undefined, attachments = [] } = data;
      const attachment = attachments.map(item => item.id);
      if (requestDetail) {
        yield put({
          type: 'updateState',
          payload: {
            changeFlag: true,
            formData: {
              ...data,
              ...copyObj,
              bankBranch: requestDetail.bankBranch,
              bankName: requestDetail.bankName,
              holderName: requestDetail.holderName,
              paymentMethod: requestDetail.paymentMethod,
              paymentMethodDesc: requestDetail.paymentMethodDesc,
              expectedPaymentDate: requestDetail.expectedPaymentDate,
              accountNo: requestDetail.accountNo,
              attachment,
            },
            attachments,
          },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...data, ...copyObj, attachment },
            changeFlag: true,
            attachments,
          },
        });
      }
      return data;
    },

    *success({ payload }, { put, select }) {
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });
      yield put({
        type: 'updateForm',
        payload: {
          id: payload.data.id,
        },
      });
      yield put({
        type: 'init',
      });
      // 页面变为详情模式
      // yield put({
      //   type: 'updateState',
      //   payload: {
      //     formMode: 'DESCRIPTION',
      //   },
      // });
    },

    *save({ payload }, { put, select }) {
      const { formData, cb } = payload;
      const { id } = formData;
      let output;
      if (id && id > 0) {
        // 编辑
        output = yield outputHandle(purchaseOverallModify, formData, cb);
      } else {
        // 新增
        output = yield outputHandle(purchaseCreate, formData, cb);
      }
      cb(output);
    },

    *check({ payload }, { put, select }) {
      const { formData, cb } = payload;
      const { id } = formData;
      // 调整
      const output = yield outputHandle(purchaseCheck, formData, cb);
      // yield put({ type: 'success', payload: output });
      cb(output);
    },

    *fetchBudgetType({ payload }, { put, select }) {
      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:CHARGE_CLASSIFICATION',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        label: item.selectionName,
      }));

      yield put({
        type: 'updateState',
        payload: {
          purTypeList: list,
        },
      });
    },
    /**
     * 收款账户
     * @param payload
     * @param put
     * @param select
     * @returns {IterableIterator<Promise<OutputProps | OutputProps | any>|*>}
     */
    *fetchAccountList({ payload }, { put, select }) {
      const {
        formData: { accountNo },
      } = yield select(({ purchaseDisplayPage }) => purchaseDisplayPage);
      const { data } = yield outputHandle(accountSelectPaging, { limit: 0, ...payload });
      const accountList = data.rows.map(item => ({
        ...item,
        value: item.accountNo,
        title: item.accountNo,
      }));

      yield put({
        type: 'updateState',
        payload: {
          accountList,
        },
      });

      if (accountList.length > 0) {
        yield put({
          type: 'updateForm',
          payload: {
            accountNo: accountList[0].accountNo,
            holderName: accountList[0].holderName,
            bankName: accountList[0].bankName,
            bankBranch: accountList[0].bankBranch,
          },
        });
      }
    },

    /**
     * 获取核算项目
     * @param payload
     * @param put
     * @param select
     * @returns {IterableIterator<Promise<OutputProps | OutputProps>|*>}
     */
    *fetchBusinessAccItem({ payload }, { put, select }) {
      const output = yield outputHandle(businessAccItemPaging, payload, undefined, false);

      let list = [];

      if (output.ok) {
        list = output.data.rows
          .sort((d1, d2) => d1.busAccItemCode.localeCompare(d2.busAccItemCode))
          .map(item => ({
            ...item,
            id: item.busAccItemId,
            value: item.busAccItemId,
            title: item.busAccItemName,
            parentId: item.parentId + '',
          }));
      }

      yield put({
        type: 'updateState',
        payload: {
          businessAccItemList: list,
        },
      });
    },

    *fetchBudgetList({ payload }, { put, select }) {
      const { data } = yield outputHandle(budgetItemListPaging, { limit: 0 });
      const budgetList = data.rows.map(item => ({ ...item, title: item.budgetName }));

      yield put({
        type: 'updateState',
        payload: {
          budgetList,
        },
      });
    },

    *fetchFinancialAccSubjList({ payload }, { put, select }) {
      const { data } = yield outputHandle(financialAccSubjListPaging, { limit: 0 });
      const financialAccSubjList = data.rows.map(item => ({ ...item, title: item.accName }));

      yield put({
        type: 'updateState',
        payload: {
          financialAccSubjList,
        },
      });
    },

    *fetchInternalOuList({ payload }, { put, select }) {
      const {
        user: { extInfo = {} },
      } = yield select(({ user }) => user);
      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:INTERNAL_COMPANY',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        title: item.selectionName,
      }));

      let chargeCompany;
      const chargeCompanyList = list.filter(item => item.extVarchar1 === extInfo.ouAbNo);
      if (chargeCompanyList && chargeCompanyList.length > 0) {
        chargeCompany = chargeCompanyList[0].value;
      }

      yield put({
        type: 'updateState',
        payload: {
          internalOuList: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: {
          chargeCompany,
        },
      });
    },
    *setBudget({ payload }, { put, select }) {
      const { chargeProjectId, chargeBuId, budgetStatus, chargeClassification } = payload;
      // if (chargeProjectId && chargeBuId) {  //费用承担项目不选也需要自动填充相关预算
      const output = yield outputHandle(budgetSelectPaging, {
        chargeProjectId,
        chargeBuId,
        budgetStatus,
        chargeClassification,
      });
      if (output.ok) {
        if (output.data.total === 1) {
          yield put({
            type: 'updateForm',
            payload: {
              relatedBudgetId: output.data.rows[0].id,
            },
          });
        } else {
          yield put({
            type: 'updateForm',
            payload: {
              relatedBudgetId: '',
            },
          });
        }
      }
      // }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      const { taskKey } = response;
      let formMode;
      if (taskKey === 'PUR_G01_01_SUBMIT_i' || taskKey === 'PUR04_01_SUBMIT_i') {
        formMode = 'EDIT';
      } else {
        formMode = 'DESCRIPTION';
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formMode,
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },
  },

  // 同步方法
  reducers: {
    // 使用工具方法快速写updateState,updateForm,cleanState 方法
    ...commonModelReducers(defaultState),
    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData = formData;
      if (Array.isArray(element) && !element.filter(v => type(v) !== 'Object').length) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
          }
        });
      } else {
        newFormData = { ...formData, ...payload };
      }

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

    // 清空核算项目,预算项目,会计科目
    clearAllBusAccItem(state, { payload }) {
      const { formData } = state;
      const paymentPlanDetails = formData.paymentPlanDetails.map(item => ({
        ...item,
        busAccItemId: undefined,
        budgetItemId: undefined,
        finAccSubjId: undefined,
      }));
      return {
        ...state,
        formData: { ...formData, paymentPlanDetails },
      };
    },
  },
};
