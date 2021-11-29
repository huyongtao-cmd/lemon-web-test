import {
  queryContractDetail,
  saveEditContract,
  queryEditContract,
  querySubContractList,
  selectOpportunity,
  selectCustomer,
  selectUserMultiCol,
  queryContractList,
  selectSalesRegionBuMultiCol,
} from '@/services/user/Contract/sales';
import { findOppoById } from '@/services/user/management/opportunity';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'userContractEditMain',

  state: {
    subList: [],
    subListTotal: 0,
    smallClass: [],
    formData: {
      id: null,
      tenantId: null,
      contractNo: null,
      contractName: null,
      contractStatus: null,
      oppoId: null,
      ouId: null,
      ouName: null,
      userdefinedNo: null,
      mainContractId: null,
      relatedContractId: null,
      custId: null,
      custName: null,
      custProj: null,
      newContractFlag: null,
      deliveryAddress: null,
      custpaytravelFlag: null,
      reimbursementDesc: null,
      mainType: null,
      platType: null,
      promotionType: null,
      workType: null,
      rangeProp: null,
      halfOpenDesc: null,
      prodProp: null,
      projProp: null,
      briefDesc: null,
      specialConcerned: null,
      amt: null,
      extraAmt: null,
      taxRate: null,
      effectiveAmt: null,
      grossProfit: null,
      finPeriodId: null,
      saleType1: null,
      saleType2: null,
      saleContent: null,
      productId: null,
      signBuId: null,
      salesmanResId: null,
      coBuId: null,
      coResId: null,
      deliBuId: null,
      deliResId: null,
      codeliBuId: null,
      codeliResId: null,
      sourceType: '',
      externalIden: null,
      externalName: null,
      externalPhone: null,
      internalBuId: null,
      internalResId: null,
      profitDesc: null,
      signDate: null,
      startDate: null,
      endDate: null,
      informDate: null,
      informResId: null,
      informContent: null,
      activateDate: null,
      closeDate: null,
      remark: null,
      closeReason: null,
      createUserId: null,
      createTime: null,
      currCode: null,
      currCodeDesc: null,
      regionBuId: null,
      regionBuName: null,
      regionPrincipalResName: null,
    },
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryContractDetail, payload);
      yield put({
        type: 'updateState',
        payload: {
          formData: response.datum || {},
        },
      });
    },
    *querySub({ payload }, { call, put }) {
      // console.error(payload);
      const { response } = yield call(queryContractList, payload);
      // const { response } = yield call(querySubContractList, payload);
      // console.log(response);
      yield put({
        type: 'updateState',
        payload: {
          subList: Array.isArray(response.rows) ? response.rows : [], // response.datum
          subListTotal: response.total,
        },
      });
    },

    *oppo({ payload }, { call, put, select }) {
      const { response } = yield call(selectOpportunity);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          oppoData: list,
          oppoDataSource: list,
        },
      });
    },

    *cust({ payload }, { call, put, select }) {
      const { response } = yield call(selectCustomer);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          custData: list,
          custDataSource: list,
        },
      });
    },

    *bu({ payload }, { call, put, select }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          buData: list,
          signBuDataSource: list,
          deliBuDataSource: list,
          coBuDataSource: list,
          codeliBuDataSource: list,
          internalBuDataSource: list,
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

    *user({ payload }, { call, put, select }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          userData: list,
          salesmanResDataSource: list,
          deliResDataSource: list,
          coResDataSource: list,
          codeliResDataSource: list,
          internalResDataSource: list,
        },
      });
    },

    *queryLead({ payload }, { call, put, select }) {
      const { formData } = yield select(({ userContractEditMain }) => userContractEditMain);
      const { response } = yield call(findOppoById, payload);
      const leadData = response.datum || {};
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...formData,
              oppoId: leadData.id,
              oppoName: leadData.oppoName,
              custId: leadData.custId,
              custName: leadData.custName,
              deliveryAddress: leadData.deliveryAddress,
              custProj: leadData.custProj,
              saleContent: leadData.saleContent,
              signBuId: leadData.signBuId,
              signBuName: leadData.signBuName,
              salesmanResId: leadData.salesmanResId,
              salesmanResName: leadData.salesmanName,
              deliBuId: leadData.deliBuId,
              deliBuName: leadData.deliBuName,
              deliResId: leadData.deliResId,
              deliResName: leadData.deliResName,
              coBuId: leadData.coBuId,
              coBuName: leadData.coBuName,
              coResId: leadData.coResId,
              coResName: leadData.coResName,
              codeliBuId: leadData.codeliBuId,
              codeliBuName: leadData.codeliBuName,
              codeliResId: leadData.codeliResId,
              codeliResName: leadData.codeliResName,
              sourceType: leadData.sourceType,
              externalIden: leadData.externalIden,
              externalName: leadData.externalName,
              externalPhone: leadData.externalPhone,
              internalBuId: leadData.internalBuId,
              internalBuName: leadData.internalBuName,
              internalResId: leadData.internalResId,
              internalResName: leadData.internalResName,
            },
          },
        });
      }
    },
    *save({ payload }, { call, put, select }) {
      const { formData } = yield select(({ userContractEditMain }) => userContractEditMain);
      const { status, response } = yield call(saveEditContract, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
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
  },
};
