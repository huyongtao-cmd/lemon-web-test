import { isEmpty } from 'ramda';
import { closeThenGoto } from '@/layouts/routerControl';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import { getViewConf } from '@/services/gen/flow';
import { passAndReturnFlowFn } from '@/services/sys/flowHandle';
import createMessage from '@/components/core/AlertMessage';
import {
  createPurchaseContract,
  queryContractDetail,
  linkagePurchaseSupplier,
  linkagePurchaseBu,
  queryPurchaseDetail,
  editPurchase,
  queryPlanList,
} from '@/services/user/Contract/sales';
import { fromQs } from '@/utils/stringUtils';

const makeSumItem = row =>
  Object.keys(row)
    // eslint-disable-next-line
    .map(key => {
      if (key === 'actualPayAmt' || key === 'unPayAmt') return { [key]: undefined };
      return { [key]: -1 };
    })
    // eslint-disable-next-line
    .reduce((prev, curr) => {
      return { ...prev, ...curr };
    }, {});

export default {
  namespace: 'purchasesContractDetail',

  state: {
    formData: {
      contractNo: null, // "HTxxxx",
      contractName: null, // "YApiTest",
      contractStatus: 'CREATE', // "CREATE",
      signDate: null, // "2018-01-01",
      remark: null, // "测试采购合同",
      closeReason: null, // "close",
      amt: null, // 1000000,
      finPeriodId: null, // 1,
      signBuId: null, // 1,
      salesmanResId: null, // 1,
      deliBuId: null, // 1,
      deliResId: null, // 1,
      platType: null, // "EXTERNAL",
      purchaseType: null, // "ADMINISTRATION",
      subContractId: null, // 1,
      productName: null, // "产品名称",
      briefDesc: null, // "111",
      taxRate: null, // 6,
      purchaseBuId: null, // 1,
      purchaseLegalId: null, // 3,
      activateDate: null, // "2018-01-01",
      closeDate: null, // "2018-01-01",
      purchaseType1: null, // "01",
      purchaseType2: null, // "01",
      supplierId: null, // "1",
      supplierBuId: null, // 2
      currCode: null,
      currCodeDesc: null,
    },
    list: [],
    fieldsConfig: {
      panels: [],
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
  },

  effects: {
    /* 获取采购合同详情 */
    *queryPurchase({ payload }, { call, put, select }) {
      const { response } = yield call(queryPurchaseDetail, payload);
      const purchaseData = response.datum || {};
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: purchaseData,
          },
        });
      }
    },
    *queryPlanList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryPlanList, { pcontractId: payload });
      if (status === 200) {
        const list = Array.isArray(response.rows) ? response.rows : [];
        let compileList = [];
        if (!isEmpty(list)) {
          // init sumItem
          const tail = {
            actualPayAmt: 0,
            unPayAmt: 0,
            stage: -1,
          };
          // calc sum
          list.forEach(item => {
            const { actualPayAmt = 0, unPayAmt = 0 } = item;
            tail.actualPayAmt = mathAdd(tail.actualPayAmt || 0, actualPayAmt || 0);
            tail.unPayAmt = mathAdd(tail.unPayAmt || 0, unPayAmt || 0);
          });
          compileList = [
            // eslint-disable-next-line
            ...list.map(item => {
              return { ...item, unPayAmt: sub(item.payAmt || 0, item.actualPayAmt || 0) };
            }),
            { ...makeSumItem(list[0]), ...tail },
          ];

          yield put({
            type: 'updateState',
            payload: {
              list: compileList,
            },
          });
        } else {
          yield put({
            // 没有明细数据，清空明细行
            type: 'updateState',
            payload: {
              list: [],
            },
          });
        }
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },
    *flowHandle({ payload }, { call, put }) {
      const { status, response } = yield call(passAndReturnFlowFn, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto('/user/flow/process');
      } else {
        createMessage({ type: 'error', description: '操作失败' });
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
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
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
