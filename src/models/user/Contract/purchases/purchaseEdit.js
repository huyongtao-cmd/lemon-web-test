import { isEmpty } from 'ramda';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import {
  linkagePurchaseSupplier,
  linkagePurchaseBu,
  queryPurchaseDetail,
  editPurchase,
  queryPlanList,
  payPlanPatchSave,
} from '@/services/user/Contract/sales';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';

const defaultFormData = {
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
  thirdPartFlag: 0,
};

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
  namespace: 'userContractPurchaseEdit',
  state: {
    formData: defaultFormData,
    list: [],
    selectedRowKeys: [],
    deletedKeys: [],
    payStatusUDC: [],
  },
  effects: {
    /* 获取采购合同详情 */
    *queryPurchase({ payload }, { call, put, all }) {
      const { purchaseData, planData, payStatusUDCData } = yield all({
        purchaseData: call(queryPurchaseDetail, payload),
        planData: call(queryPlanList, { pcontractId: payload }),
        payStatusUDCData: call(queryUdc, 'ACC.PAY_STATUS'),
      });

      if (purchaseData.response.ok && planData.status === 200) {
        const formData = purchaseData.response.datum || defaultFormData;
        const list = Array.isArray(planData.response.rows) ? planData.response.rows : [];

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
        }
        yield put({
          type: 'updateState',
          payload: {
            formData,
            list: compileList,
            payStatusUDC: Array.isArray(payStatusUDCData.response) ? payStatusUDCData.response : [],
          },
        });
        if (formData.purchaseType && formData.purchaseType === 'PROJECT') {
          yield put({
            type: 'udc1',
            payload: {
              defId: 'TSK:PURCHASE_TYPE1',
              parentDefId: 'TSK:PURCHASE_TYPE',
              parentVal: 'PROJECT',
            },
          });
        } else if (formData.purchaseType && formData.purchaseType === 'ADMINISTRATION') {
          yield put({
            type: 'udc1',
            payload: {
              defId: 'TSK:PURCHASE_TYPE1',
              parentDefId: 'TSK:PURCHASE_TYPE',
              parentVal: 'ADMINISTRATION',
            },
          });
        }
      }
    },

    *saveEdit({ payload }, { call, put, select }) {
      const { purchaseContractEntity, pContractPayload } = payload;
      if (purchaseContractEntity.remark && purchaseContractEntity.remark.length > 200) {
        createMessage({ type: 'error', description: '备注文字过长' });
        return;
      }
      const { status, response } = yield call(editPurchase, purchaseContractEntity);
      if (status === 100) {
        // 主动取消请求
        return;
      }

      if (response.ok) {
        const { status: sts, response: res } = yield call(payPlanPatchSave, pContractPayload);
        if (sts === 100) {
          // 主动取消请求
          return;
        }
        if (sts === 200 && res.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          const { pid, from } = fromQs();
          yield put({
            type: 'queryPurchase',
            payload: pid,
          });
          closeThenGoto(from);
        } else {
          createMessage({ type: 'error', description: res.reason || '采购合同付款计划保存失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },

    *linkageBu({ payload }, { call, put, select }) {
      const { status, response } = yield call(linkagePurchaseBu, payload);
      const res = response.datum || {};
      yield put({
        type: 'updateForm',
        payload: {
          purchaseBuId: payload,
          purchaseLegalNo: res.purchaseLegalNo,
          purchaseLegalName: res.purchaseLegalName,
        },
      });
      return res;
    },

    *linkageSupplier({ payload }, { call, put }) {
      const { response } = yield call(linkagePurchaseSupplier, payload);
      const res = response.datum || {};
      if (response.ok) {
        if (res.buId) {
          yield put({
            type: 'updateForm',
            payload: {
              supplierLegalNo: res.supplierLegalNo,
              supplierLegalName: res.supplierLegalName,
            },
          });
        }
        yield put({
          type: 'updateForm',
          payload: {
            supplierId: payload,
            supplierBuId: res.buId,
          },
        });
      }
      return res;
    },

    *udc1({ payload }, { call, put }) {
      const { response } = yield call(queryCascaderUdc, payload);
      yield put({
        type: 'updateState',
        payload: {
          udcType1: response || [],
        },
      });
    },

    *udc2({ payload }, { call, put }) {
      const { response } = yield call(queryCascaderUdc, payload);
      yield put({
        type: 'updateState',
        payload: {
          udcType2: response || [],
        },
      });
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
        formData: defaultFormData,
      };
    },
  },
};
