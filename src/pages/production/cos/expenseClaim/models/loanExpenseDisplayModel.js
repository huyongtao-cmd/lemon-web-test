// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';
// service方法
import {
  expenseClaimCreate,
  expenseClaimDetail,
  expenseClaimOverallModify,
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
  loanApplySelectPaging,
} from '@/services/production/common/select';
import { budgetItemListPaging, financialAccSubjListPaging } from '@/services/production/acc';
import { customSettingDetailByKey } from '@/services/production/system/customSetting';

// 默认状态
const defaultState = {
  formData: {
    chargeClassification: 'DAILY',
    foreignCurrencyFlag: false,
    originalCurrency: undefined,
    expenseDocType: 'LOAN',
    originalCurrencyAmt: 0,
    baseCurrencyAmt: 0,
    paymentAmt: 0,
    exchangeRate: 1,
    expenseClaimStatus: 'CREATE',
    details: [],
    compareInfos: [],
  },
  deleteKeys: [],
  formMode: 'EDIT',
  currentNode: 'create', // create:创建节点,都可以修改 applyEdit:申请人修改节点 financeEdit:财务修改节点 advanceEdit:高级修改
  copy: false,
  unExpandedRowKeys: [],
  internalOuList: [],
  businessAccItemList: [],
  budgetList: [],
  financialAccSubjList: [],
  accountList: [],
  loanApplyList: [],
  taskId: undefined,
  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
};

export default {
  namespace: 'loanExpenseDisplay',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ loanExpenseDisplay }) => loanExpenseDisplay);

      if (!id) {
        return {};
      }
      const { data } = yield outputHandle(expenseClaimDetail, { id });
      if (isNil(data.details)) {
        data.details = [];
      }
      data.details = data.details.map(item => ({
        ...item,
        deductTaxRate: item.deductTaxRate && item.deductTaxRate + '%',
        finAccSubjId2: Array.isArray(item.invoiceList)
          ? item.invoiceList.map(v => v.invoiceNo || '').join(',')
          : '',
        invIdList: Array.isArray(item.invoiceList) ? item.invoiceList.map(v => v.id) : [],
      }));
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      const formData2 = { ...data, ...copyObj };
      const { attachments } = data;
      const file = attachments.map(item => item.id);
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
      } = yield select(({ user, loanExpenseDisplay }) => ({
        ...user,
        ...loanExpenseDisplay,
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
        let chargeCompany2Desc;
        const chargeCompanyList = list.filter(item => item.extVarchar1 === extInfo.ouAbNo);
        if (chargeCompanyList && chargeCompanyList.length > 0) {
          chargeCompany2 = chargeCompanyList[0].value;
          chargeCompany2Desc = chargeCompanyList[0].title;
        }
        yield put({
          type: 'updateForm',
          payload: {
            chargeCompany: chargeCompany2,
            chargeCompanyDesc: chargeCompany2Desc,
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
      } = yield select(({ loanExpenseDisplay }) => loanExpenseDisplay);
      const { flag } = payload;
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

    *fetchLoanApplyList({ payload }, { put, select }) {
      const { loanResId } = payload;
      const { data } = yield outputHandle(loanApplySelectPaging, {
        notUseFlag: true,
        loanResId,
        loanStatus: 'PAID_TO_WRITE_OFF',
      });
      const loanApplyList = data.rows.map(item => ({
        ...item,
        value: item.id,
        title: item.loanBrief,
      }));

      yield put({
        type: 'updateState',
        payload: {
          loanApplyList,
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
      formData.details = formData.details.map(item => ({
        ...item,
        deductTaxRate: item.deductTaxRate && item.deductTaxRate.replace('%', ''),
      }));
      let output;
      if (id && id > 0) {
        // 编辑
        if (formData.details != null) {
          formData.details = formData.details.map(d => {
            if (d.detailAppropriationAmt && !Array.isArray(d.detailAppropriationAmt)) {
              // eslint-disable-next-line no-param-reassign
              d.detailAppropriationAmt = Array.of(d.detailAppropriationAmt);
            }
            if (d.detailAppropriationAmt === '') {
              // eslint-disable-next-line no-param-reassign
              d.detailAppropriationAmt = Array.of('');
            }
            return d;
          });
        }
        output = yield outputHandle(
          expenseClaimOverallModify,
          omit(['createUserId', 'createTime'], formData),
          cb
        );
      } else {
        // 新增
        output = yield outputHandle(
          expenseClaimCreate,
          omit(['createUserId', 'createTime'], formData),
          cb
        );
      }
      cb(output);
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      const { taskKey } = response;
      let formMode;
      let currentNode;

      if (taskKey === 'COS04_01_SUBMIT_i') {
        formMode = 'EDIT';
        currentNode = 'create';
      } else if (
        taskKey === 'COS04_03_AUDITING' ||
        taskKey === 'COS04_04_FINANCE_MANGER' ||
        taskKey === 'COS04_05_FINANCE_IN_CHARGE'
      ) {
        formMode = 'EDIT';
        currentNode = 'financeEdit';
        yield put({
          type: 'updateForm',
          payload: {
            accountingDate: moment().format('YYYY-MM-DD'),
          },
        });
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
            if (Object.keys(ele)[0] === 'claimAmt') {
              // 计算总金额
              const { details } = newFormData;
              const originalCurrencyAmt = details
                .map(item => item.claimAmt)
                .reduce((a, b) => Number(isNil(a) ? 0 : a) + Number(isNil(b) ? 0 : b), 0);
              const baseCurrencyAmt =
                originalCurrencyAmt * (isNil(formData.exchangeRate) ? 1 : formData.exchangeRate);
              newFormData.originalCurrencyAmt = originalCurrencyAmt;
              newFormData.baseCurrencyAmt = baseCurrencyAmt;
              newFormData.paymentAmt = baseCurrencyAmt;
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
