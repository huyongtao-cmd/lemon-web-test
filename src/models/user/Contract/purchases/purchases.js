import { closeThenGoto } from '@/layouts/routerControl';
import {
  createPurchaseContract,
  queryContractDetail,
  linkagePurchaseSupplier,
  linkagePurchaseBu,
  editPurchase,
} from '@/services/user/Contract/sales';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

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
  currCode: 'CNY',
  currCodeDesc: null,
  thirdPartFlag: 0,
};

export default {
  namespace: 'purchasesContract',

  state: {
    smallClass: [],
    udcType1: [],
    udcType2: [],
    formData: defaultFormData,
  },

  effects: {
    /* 获取子合同详情，初始化采购合同 */
    *querySub({ payload }, { call, put, select }) {
      const { formData } = yield select(({ purchasesContract }) => purchasesContract);
      const { response } = yield call(queryContractDetail, payload);
      const subData = response.datum || {};

      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formData,
            deliBuId: subData.deliBuId,
            deliBuName: subData.deliBuName,
            deliResId: subData.deliResId,
            deliResName: subData.deliResName,
            signBuId: subData.signBuId,
            signBuName: subData.signBuName,
            salesmanResId: subData.salesmanResId,
            salesmanResName: subData.salesmanResName,
            activateDate: subData.activateDate,
            closeDate: subData.closeDate,
            subContractId: subData.id,
            subContractName: subData.contractName,
          },
        },
      });
    },

    *create({ payload }, { call, put, select }) {
      const { formData } = yield select(({ purchasesContract }) => purchasesContract);
      const { status, response } = yield call(createPurchaseContract, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        const { mainId, id } = fromQs();
        let router = `/sale/contract/purchasesEdit?pid=${response.datum}`;
        if (mainId && id) {
          router += `&mainId=${mainId}&id=${id}`;
        }
        closeThenGoto(router);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },

    *edit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ purchasesContract }) => purchasesContract);
      const { status, response } = yield call(editPurchase, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
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
