import { closeThenGoto } from '@/layouts/routerControl';
import { linkagePurchaseSupplier, linkagePurchaseBu } from '@/services/user/Contract/sales';
import { selectOuByOuId } from '@/services/sale/purchaseContract/purchaseContract';
import {
  selectAssociation,
  queryEdit,
  save,
} from '@/services/sale/purchaseAgreement/purchaseAgreement';
import {
  selectAbOus,
  getProductClass,
  selectExternalUser,
  selectAllAbOu,
} from '@/services/gen/list';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { queryUserPrincipal } from '@/services/gen/user';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const defaultFormData = {
  purchaseAgreementNo: null,
  purchaseAgreementName: null,
  agreementType: null,
  acceptanceType: null,
  signingLegalNo: null,
  signingLegalDesc: null,
  supplierLegalNo: null,
  supplierLegalDesc: null,
  signingBuId: null,
  purchaseInchargeResId: null,
  signDate: moment().format('YYYY-MM-DD'),
  effectiveStartDate: null,
  effectiveEndDate: null,
  applicationDate: null,
  currCode: 'CNY',
  amt: null,
  taxRate: null,
  taxAmt: null,
  invoice: null,
  payMethod: null,
  activateDate: null,
  overWhy: null,
  overTime: null,
  preDocResId: null,
  createUserName: null,
  createTime: null,
  agreementStatus: null,
  attAgreementNo: null,
};

export default {
  namespace: 'salePurchaseAgreementsEdit',
  state: {
    formData: defaultFormData,
    agreementDetailsEntities: [],
    agreementDetailsDeletedKeys: [],
    agreementResEntities: [],
    agreementResDeletedKeys: [],
    resSetRateEntities: [],
    resSetRateDeletedKeys: [],
    agreementEntities: [],
    agreementDeleteKeys: [],
    productClassrArr: [],
    abOusArr: [],
    allAbOusArr: [],
    projectArr: [],
    associationArr: [],
    resArr: [],
    pageConfig: {},
  },
  effects: {
    /* 获取采购合同详情 */
    *queryEdit({ payload }, { call, put, all }) {
      const { response } = yield call(queryEdit, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            agreementDetailsEntities: response.agreementDetailsViews,
            agreementResEntities: response.agreementResViews,
            resSetRateEntities: response.resSetRateViews,
            agreementEntities: response.associationAgreementViews,
          },
        });
      }
    },

    *save({ payload }, { call, put, select }) {
      const { response } = yield call(save, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(`/sale/purchaseContract/purchaseAgreementList?refresh=${moment().valueOf()}`);
        // yield put({
        //   type: 'queryEdit',
        //   payload: response.datum.purchaseAgreementEntity.id,
        // });
      } else {
        createMessage({
          type: 'error',
          description: `保存失败,错误原因：${response.reason}` || '保存失败',
        });
      }
    },

    *linkageBu({ payload }, { call, put, select }) {
      const { status, response } = yield call(linkagePurchaseBu, payload);
      const res = response.datum || {};
      return res;
    },

    *selectAssociation({ payload }, { call, put }) {
      const { response } = yield call(selectAssociation, payload);
      yield put({
        type: 'updateState',
        payload: {
          associationArr: response || [],
        },
      });
    },

    *selectAbOus({ payload }, { call, put }) {
      const { response } = yield call(selectAbOus, payload);
      yield put({
        type: 'updateState',
        payload: {
          abOusArr: response || [],
        },
      });
    },

    *selectAllAbOu({ payload }, { call, put }) {
      const { response } = yield call(selectAllAbOu, payload);
      yield put({
        type: 'updateState',
        payload: {
          allAbOusArr: response || [],
        },
      });
    },

    *selectOuByOuId({ payload }, { call, put }) {
      const { response } = yield call(selectOuByOuId, payload);
      return response;
    },

    *selectExternalUser({ payload }, { call, put }) {
      const { response } = yield call(selectExternalUser, payload);
      yield put({
        type: 'updateState',
        payload: {
          resArr: response || [],
        },
      });
    },

    *getProductClass({ payload }, { call, put }) {
      const { response } = yield call(getProductClass, payload);
      yield put({
        type: 'updateState',
        payload: {
          productClassrArr: response || [],
        },
      });
    },

    *fetchPrincipal(_, { call, put }) {
      const { response } = yield call(queryUserPrincipal);
      return response;
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
    clear(state, { payload }) {
      return {
        ...state,
        formData: defaultFormData,
        agreementDetailsEntities: [],
        agreementDetailsDeletedKeys: [],
        agreementResEntities: [],
        agreementResDeletedKeys: [],
        resSetRateEntities: [],
        resSetRateDeletedKeys: [],
        agreementEntities: [],
        agreementDeleteKeys: [],
        productClassrArr: [],
        abOusArr: [],
        allAbOusArr: [],
        projectArr: [],
        associationArr: [],
        resArr: [],
        pageConfig: {},
      };
    },
  },
};
