// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import {
  tripManagementClaimCreate,
  tripManagementClaimOverallModify,
  tripManagementClaimDetail,
  getAllBookingDetail,
} from '../../../../services/production/adm/trip/tripApply';
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
import { add } from '@/utils/mathUtils';

// 默认状态
const defaultState = {
  formData: {
    details: [],
    baseCurrencyClaimAmt: 0,
    originalCurrency: 'CNY',
    tripTicketBookingIdArr: [],
  },
  formMode: 'EDIT',
  applyStatus: 'CREATE',
  copy: false,
  id: undefined,
  deleteKeys: [],
  budgetList: [],
  accountList: [],
  taskId: undefined,
  from: undefined,
  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
  payAccountList: [],
  currentNode: undefined,
  attachments: [],
};

export default {
  namespace: 'tripManagementClaimDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ tripManagementClaimDisplayPage }) => tripManagementClaimDisplayPage);
      if (!id) {
        return {};
      }
      const { data } = yield outputHandle(tripManagementClaimDetail, { id });
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      const { attachments = [] } = data;
      const attachment = attachments.map(item => item.id);
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj, attachment },
          attachments,
        },
      });
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
      const { formData } = payload;
      const { id } = formData;
      let output;
      if (id && id > 0) {
        // 编辑
        output = yield outputHandle(
          tripManagementClaimOverallModify,
          formData,
          'tripManagementClaimDisplayPage/success'
        );
      } else {
        // 新增
        output = yield outputHandle(
          tripManagementClaimCreate,
          formData,
          'tripManagementClaimDisplayPage/success'
        );
      }
      yield put({ type: 'success', payload: output });
    },

    //查询行政订票下所有明细
    *getAllBookingDetail({ payload }, { put, select }) {
      // 更新
      const output = yield outputHandle(getAllBookingDetail, { ids: payload.join(',') });
      const list = output.data.map(item => ({
        ...item,
        temName: item.ticketNo,
        unitPrice: item.baseCurrencyBookAmt,
        amt: item.baseCurrencyBookAmt,
        deliveryDate: item.bookDateDesc,
      }));
      const reduce = output.data
        .map(item => item.baseCurrencyBookAmt)
        .reduce((x, y) => add(x || 0, y || 0));
      yield put({
        type: 'updateForm',
        payload: {
          details: list,
          baseCurrencyClaimAmt: reduce,
        },
      });
    },

    // *complete({ payload }, { put, select }) {
    //   const { formData } = payload;
    //   // 完成
    //   yield outputHandle(paymentComplete, formData);
    // },

    // *delete({ payload }, { put, select }) {getAllBookingDetail
    //   const { formData } = payload;
    //   // 删除
    //   yield outputHandle(paymentRequestLogicalDelete, formData);
    // },

    *fetchAccountList({ payload }, { put, select }) {
      const {
        formData: { accountNo },
      } = yield select(({ tripManagementClaimDisplayPage }) => tripManagementClaimDisplayPage);
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

      if (accountList.length > 0 && !accountNo) {
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
      const { data } = yield outputHandle(financialAccSubjListPaging, {
        limit: 0,
        chargeClassification: 'chargeClassification',
      });
      const financialAccSubjList = data.rows.map(item => ({ ...item, title: item.accName }));

      yield put({
        type: 'updateState',
        payload: {
          financialAccSubjList,
        },
      });
      return financialAccSubjList;
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      const { taskKey } = response;
      let formMode;
      let currentNode;
      if (taskKey === 'PUR_G02_01_SUBMIT_i' || taskKey === 'ADM_M07_01_SUBMIT_i') {
        formMode = 'EDIT';
        currentNode = 'create';
      } else if (taskKey === 'ADM_M07_03_FIN_AUDIT_APPROVAL') {
        formMode = 'EDIT';
        currentNode = 'financeEdit';
      } else if (taskKey === 'ADM_M07_06_CASHIER_PAYMENT') {
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
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
            currentNode,
          },
        });
        return response || {};
      }
      return {};
    },

    *fetchAbAccByCompanys({ payload }, { put, select }) {
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
        title: item.accountNo,
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
      } = yield select(({ tripManagementClaimDisplayPage }) => tripManagementClaimDisplayPage);
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
  },
};
