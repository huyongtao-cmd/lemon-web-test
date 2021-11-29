import { fromQs } from '@/utils/stringUtils';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

import {
  createSaleSub,
  queryContractDetail,
  selectUserMultiCol,
  selectSalesRegionBuMultiCol,
} from '@/services/user/Contract/sales';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'userContractCreateSub',

  state: {
    smallClass: [],
    formData: {
      contractNo: null, // "HTSUBxx"
      contractName: null, // "YApiSubTest"
      contractStatus: 'CREATE', // "CREATE"
      mainContractId: null, // 1
      userdefinedNo: null, // 1
      remark: null, // "测试销售合同"
      closeReason: null, // "close"
      amt: null, // 1000000
      extraAmt: null, // 10000
      effectiveAmt: null, // 900000
      grossProfit: null, // 800000
      finPeriodId: null, // 1
      deliveryAddress: null, // "交付地点"
      saleType1: null, // "01"
      saleType2: null, // "01"
      signBuId: null, // 1
      salesmanResId: null, // 1
      deliBuId: null, // 1
      deliResId: null, // 1
      regionBuId: null, // 销售区域BU_ID
      mainType: 'SUB', // "SUB"
      sourceType: null, // "EXTERNAL"
      externalIden: null, // "外部必填(可从商机带入)"
      externalName: null, // "YApi"
      externalPhone: null, // "13000000000"
      internalBuId: null, // 2
      internalResId: null, // 3
      profitDesc: null, // "承诺没有bug"
      startDate: null, // "2018-01-01"
      endDate: null, // "2018-11-01"
      productId: null, // 1
      briefDesc: null, // "说明"
      workType: null, // "01"
      promotionType: null, // "01"
      rangeProp: null, // "OPEN"
      halfOpenDesc: null, // "说明"
      prodProp: null, // "EL"
      projProp: null, // "NEW"
      channelType: null, // "DIRECT"
      cooperationType: null, // "DEF"
      custpaytravelFlag: null, // 0
      reimbursementDesc: null, // "说明
      taxRate: null, // 税率
      currCode: null,
      currCodeDesc: null,
      preSaleBuId: null, // 售前bu
      preSaleResId: null, // 售前负责人
    },
    deliBuDataSource: null,
    pageConfig: {},
  },

  effects: {
    /* 获取主合同详情 */
    *queryMain({ payload }, { call, put, select }) {
      const { response } = yield call(queryContractDetail, payload);
      const { formData } = yield select(({ userContractCreateSub }) => userContractCreateSub);
      const mainData = response.datum || {};
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formData,
            mainContractId: mainData.id,
            mainContractName: mainData.contractName,
            signBuId: mainData.ouId,
            signBuName: mainData.signBuName,
            signDate: mainData.signDate,
            salesmanResId: mainData.salesmanResId,
            salesmanResName: mainData.salesmanResName,
            sourceType: mainData.sourceType,
            contractStatus: 'CREATE',
            mainType: 'SUB',
            regionBuId: mainData.regionBuId,
            regionBuName: mainData.regionBuName,
            subContractDefaultName: mainData.subContractDefaultName,
          },
        },
      });
    },

    *createInfo({ payload }, { call, put, select }) {
      const { formData } = yield select(({ userContractCreateSub }) => userContractCreateSub);
      const { status, response } = yield call(createSaleSub, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: response.reason });
        closeThenGoto(`/sale/contract/salesEdit?id=${fromQs().mainId}`);
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },

    *UDC_SmallClass({ payload }, { call, put }) {
      const { response } = yield call(queryCascaderUdc, {
        defId: 'TSK:SALE_TYPE2',
        parentDefId: 'TSK:SALE_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            smallClass: Array.isArray(response) ? response : [],
          },
        });
      }
    },

    *bu({ payload }, { call, put, select }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          buData: list,
          deliBuDataSource: list,
          preSaleBuDataSource: list,
          regionBuData: list,
          regionBuDataSource: list,
        },
      });
      const { deliBuDataSource, preSaleBuDataSource } = yield select(
        ({ userContractCreateSub }) => userContractCreateSub
      );
    },

    *user({ payload }, { call, put, select }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          userData: list,
          deliResDataSource: list,
          preSaleResDataSource: list,
        },
      });
    },

    *salesRegionBu({ payload }, { call, put, select }) {
      const { response } = yield call(selectSalesRegionBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          salesRegionBuData: list,
          salesRegionBuDataSource: list,
        },
      });
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
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
        formData: {},
      };
    },
  },
};
