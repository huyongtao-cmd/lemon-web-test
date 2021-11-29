import {
  transferMoneyListRq,
  transferMoneyDeleteRq,
  getTransferCompanyUri,
} from '@/services/plat/transferMoney';
import { queryReasonList } from '@/services/user/timesheet/timesheet';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};

export default {
  namespace: 'transferMoneyList',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: 0,
    transferCompanyList: [],
    collectionCompanyList: [],
    selectedRowKeys: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(transferMoneyListRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 申请人
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
    // 申请人所属BU
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuDataSource: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: { applicantBuId: '', applicantBuName: '' },
      });
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
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(transferMoneyDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ transferMoneyList }) => transferMoneyList);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
