// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';
// service方法
import {
  loanApplyCreate,
  loanApplyDetail,
  loanApplyOverallModify,
} from '@/services/production/cos';
import { isNil, omit } from 'ramda';
import moment from 'moment';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils.ts';
import { getViewConf } from '@/services/gen/flow';
import { customSelectionListByKey } from '@/services/production/system';
import {
  businessAccItemPaging,
  accountSelectPaging,
  budgetSelectPaging,
} from '@/services/production/common/select';
import { budgetItemListPaging, financialAccSubjListPaging } from '@/services/production/acc';
import { customSettingDetailByKey } from '@/services/production/system/customSetting';

// 默认状态
const defaultState = {
  formData: {
    chargeClassification: '',
    foreignCurrencyFlag: false,
    originalCurrency: undefined,
    originalCurrencyAmt: 0,
    baseCurrencyAmt: 0,
    paymentAmt: 0,
    exchangeRate: 1,
    loanStatus: 'CREATE',
    details: [],
  },
  deleteKeys: [],
  formMode: 'EDIT',
  currentNode: 'create', // create:创建节点,都可以修改 applyEdit:申请人修改节点 financeEdit:财务修改节点 advanceEdit:高级修改
  copy: false,
  internalOuList: [],
  businessAccItemList: [],
  budgetList: [],
  financialAccSubjList: [],
  financialAccSubjListLow: [],
  accountList: [],
  budgetTypeList: [],
  taskId: undefined,
  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
  payAccountList: [],
  attachments: [],
};

export default {
  namespace: 'loanDisplay',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ loanDisplay }) => loanDisplay);

      if (!id) {
        return defaultState.formData;
      }
      const { data } = yield outputHandle(loanApplyDetail, { id });
      if (data.createTime) {
        data.createTime = moment(data.createTime).format('YYYY-MM-DD');
      }
      if (isNil(data.details)) {
        data.details = [];
      }
      data.details = data.details.map(item => ({
        ...item,
        deductTaxRate: item.deductTaxRate && item.deductTaxRate + '%',
      }));
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      const { attachments } = data;
      const file = attachments.map(item => item.id);
      const formData2 = { ...data, ...copyObj };
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...formData2, file },
          internalOuList: [{ value: formData2.chargeCompany, title: formData2.chargeCompanyDesc }],
          attachments,
        },
      });
      return formData2;
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
          budgetTypeList: list,
        },
      });
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

    *fetchInternalOuList({ payload }, { put, select }) {
      const {
        user: { extInfo = {} },
        formData: { chargeCompany, id },
      } = yield select(({ user, loanDisplay }) => ({
        ...user,
        ...loanDisplay,
      }));
      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:INTERNAL_COMPANY',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        title: item.selectionName,
      }));
      if (!chargeCompany) {
        let chargeCompany2;
        const chargeCompanyList = list.filter(item => item.extVarchar1 === extInfo.ouAbNo);
        if (chargeCompanyList && chargeCompanyList.length > 0) {
          chargeCompany2 = chargeCompanyList[0].value;
        }
        yield put({
          type: 'updateForm',
          payload: {
            chargeCompany: chargeCompany2,
          },
        });
      }

      yield put({
        type: 'updateState',
        payload: {
          internalOuList: list,
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

    /**
     * 获取自定义设置项
     * @param payload
     * @param put
     * @param select
     * @returns {IterableIterator<Promise<OutputProps | OutputProps>|*>}
     */
    *fetchCustomSetting({ payload }, { put, select }) {
      const { data } = yield outputHandle(customSettingDetailByKey, { key: 'BASE_CURRENCY' });

      yield put({
        type: 'updateForm',
        payload: {
          paymentCurrency: data.settingValue,
          originalCurrency: data.settingValue,
        },
      });
    },

    *fetchAccountList({ payload }, { put, select }) {
      const {
        formData: { accountNo },
      } = yield select(({ loanDisplay }) => loanDisplay);
      const { flag } = payload;
      const { data } = yield outputHandle(accountSelectPaging, { limit: 0, ...payload });
      const accountList = data.rows.map(item => ({
        ...item,
        value: item.id,
        title: item.accountNo,
      }));

      yield put({
        type: 'updateState',
        payload: {
          accountList,
        },
      });

      if (flag) {
        //切换报销人
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

        if (accountList.length === 0) {
          yield put({
            type: 'updateForm',
            payload: {
              accountNo: undefined,
              holderName: undefined,
              bankName: undefined,
              bankBranch: undefined,
            },
          });
        }
      } else if (accountList.length > 0 && !accountNo) {
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

    *fetchFinancialAccSubjListLow({ payload }, { put, select }) {
      const { data } = yield outputHandle(financialAccSubjListPaging, {
        limit: 0,
        chargeClassification: 'chargeClassification',
      });
      const financialAccSubjListLow = data.rows.map(item => ({ ...item, title: item.accName }));

      yield put({
        type: 'updateState',
        payload: {
          financialAccSubjListLow,
        },
      });
      return financialAccSubjListLow;
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
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });
    },

    *save({ payload }, { put, select }) {
      const { formData, cb } = payload;
      const { id } = formData;
      let output;
      if (id && id > 0) {
        // 编辑
        output = yield outputHandle(
          loanApplyOverallModify,
          omit(['createUserId', 'createTime'], formData),
          cb
        );
      } else {
        // 新增
        output = yield outputHandle(
          loanApplyCreate,
          omit(['createUserId', 'createTime'], formData),
          cb
        );
      }
      cb(output);
    },

    *fetchConfig({ payload }, { call, put }) {
      const { taskId, accountingDate } = payload;
      const { status, response } = yield call(getViewConf, taskId);
      const { taskKey } = response;
      let formMode;
      let currentNode;

      if (taskKey === 'COS11_01_SUBMIT_i') {
        formMode = 'EDIT';
        currentNode = 'create';
      } else if (
        taskKey === 'COS11_06_AUDITING' ||
        taskKey === 'COS11_06_PROJECT_ACCOUNTING' ||
        taskKey === 'COS11_07_FINANCE_MANGER' ||
        taskKey === 'COS11_08_FINANCE_IN_CHARGE'
      ) {
        formMode = 'EDIT';
        currentNode = 'financeEdit';
        if (!accountingDate) {
          yield put({
            type: 'updateForm',
            payload: {
              accountingDate: moment().format('YYYY-MM-DD'),
            },
          });
        }
      } else if (taskKey === 'COS11_09_CASHIER_PAYMENT') {
        //出纳付款节点
        currentNode = 'cashEdit';
      } else {
        formMode = 'DESCRIPTION';
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formMode,
            currentNode,
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response || {};
      }
      return {};
    },
    //根据费用承担公司获取付款银行账号
    *fetchAbAccByCompanys({ payload }, { call, put, select }) {
      const { companyCodes } = payload;
      if (!companyCodes) {
        // 费用承担公司为空不请求后端
        return;
      }
      const resp = yield outputHandle(accountSelectPaging, payload);
      const { data } = resp;
      const payAccountList = data.rows.map(item => ({
        ...item,
        value: item.accountNo,
        title: `${item.accountNo}-${item.holderName}`,
      }));
      yield put({
        type: 'updateState',
        payload: {
          payAccountList,
        },
      });
      const {
        formData,
        formData: { payAccountNo },
        currentNode,
      } = yield select(({ loanDisplay }) => loanDisplay);
      if (!payAccountNo && currentNode === 'cashEdit') {
        //出纳审批节点，并且表单上的付款银行账户为空，付款银行账户给初始值
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...formData,
              payAccountNo: payAccountList[0]?.accountNo,
              payHolderName: payAccountList[0]?.holderName,
              payBankBranch: payAccountList[0]?.bankBranch,
            },
          },
        });
      }
    },

    *setBudget({ payload }, { put, select }) {
      const { chargeProjectId, chargeBuId, budgetStatus, chargeClassification } = payload;
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
      let newFormData;
      if (Array.isArray(element) && name === 'details') {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
            if (Object.keys(ele)[0] === 'amt') {
              // 计算总金额
              const { details } = newFormData;
              const originalCurrencyAmt = details
                .map(item => item.amt)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const baseCurrencyAmt =
                originalCurrencyAmt * (isNil(formData.exchangeRate) ? 1 : formData.exchangeRate);
              newFormData.originalCurrencyAmt = originalCurrencyAmt;
              newFormData.baseCurrencyAmt = baseCurrencyAmt;
            }
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
      const details = formData.details.map(item => ({
        ...item,
        busAccItemId: undefined,
        budgetItemId: undefined,
        finAccSubjId: undefined,
      }));
      return {
        ...state,
        formData: { ...formData, details },
      };
    },
  },
};
