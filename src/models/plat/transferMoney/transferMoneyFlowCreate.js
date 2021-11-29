import {
  transferMoneyDetailRq,
  getTransferCompanyUri,
  getTransferAccountByIdUri,
  getCollectionAccountByIdUri,
  getApplicantBuByResIdUri,
  transferMoneyEditRq,
} from '@/services/plat/transferMoney';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUserMultiCol } from '@/services/user/Contract/sales';

const defaultFormData = {};

export default {
  namespace: 'transferMoneyFlowCreate',
  state: {
    formData: defaultFormData,
    resDataSource: [],
    baseBuDataSource: [],
    transferCompanyList: [],
    transferAccountList: [],
    collectionCompanyList: [],
    collectionAccountList: [],
  },
  effects: {
    // 重新申请时根据id查询信息
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(transferMoneyDetailRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateForm',
            payload: {
              ...response,
            },
          });
        }
        return response;
      }
      return {};
    },
    // 查询内部公司
    *queryTransferCompany({ payload }, { call, put }) {
      const { response } = yield call(getTransferCompanyUri);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          transferCompanyList: list,
          collectionCompanyList: list,
        },
      });
    },
    // 根据地址簿号查划款公司银行账号多列下拉
    *queryTransferAccount({ payload }, { call, put }) {
      const { response } = yield call(getTransferAccountByIdUri, payload);
      const list = Array.isArray(response) ? response : [];
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            transferAccountList: list,
          },
        });
      }
    },
    // 根据地址簿号查收款公司银行账号多列下拉
    *queryCollectionAccount({ payload }, { call, put }) {
      const { status, response } = yield call(getCollectionAccountByIdUri, payload);
      const list = Array.isArray(response) ? response : [];
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            collectionAccountList: list,
          },
        });
      }
    },
    // 根据选择的申请人获取申请人BU
    *queryApplicantBu({ payload }, { call, put }) {
      const { status, response } = yield call(getApplicantBuByResIdUri, payload);
      if (response) {
        yield put({
          type: 'updateForm',
          payload: {
            applicantBuId: Array.isArray(response) ? response[0].id : null,
          },
        });
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ transferMoneyFlowCreate }) => transferMoneyFlowCreate);
      const { status, response } = yield call(transferMoneyEditRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
        },
      });
    },
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuDataSource: list,
        },
      });
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          transferAccountList: [],
          collectionAccountList: [],
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
  },
};
