import moment from 'moment';
import {
  getInvoiceListRq,
  inValidInvoicesRq,
  changeOwnerRq,
  invoiceDtlRq,
  getInvoicesFromBaiwangRq,
  delInvoice,
} from '@/services/user/center/invoice';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';

const convertQueryParams = queryParams => {
  if (queryParams === void 0) return {};
  const params = { ...queryParams };
  if (params.invoiceDate) {
    params.invoiceDateStart = params.invoiceDate[0].format('YYYY-MM-DD');
    params.invoiceDateEnd = params.invoiceDate[1].format('YYYY-MM-DD');
    params.invoiceDate = void 0;
  }
  return params;
};

export default {
  namespace: 'invoiceList',
  state: {
    module: '', // 所属模块
    list: [],
    total: 0,
    searchForm: {},
    currentItem: {},
    pageConfig: null,
    detailPageConfig: null,
    expenseList: [],
    expenseTotal: 0,
    expenseSearchForm: {},
  },

  effects: {
    // 报销单用查询发票列表 -- 千万不要干掉
    *queryExpense({ payload }, { call, put }) {
      const params = convertQueryParams(payload);
      const { status, response } = yield call(getInvoiceListRq, params);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            expenseList: Array.isArray(rows) ? rows : [],
            expenseTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 从百望获取发票信息到发票池
    *getMyInvoiceModalFromBaiwang({ payload }, { call, put, select }) {
      const { status, response } = yield call(getInvoicesFromBaiwangRq);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '同步成功' });
          const {
            expenseSearchForm: { invSelected = [], ...restExpenseSearchForm },
          } = yield select(({ invoiceList }) => invoiceList);
          yield put({
            type: 'queryExpense',
            payload: {
              ...payload,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '同步失败' });
        }
      }
    },
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, { pageNo: payload.pageNo });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
      }
      return {};
    },

    *getDetailPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, { pageNo: payload.pageNo });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            detailPageConfig: response.configInfo,
          },
        });
      }
      return {};
    },

    *query({ payload }, { call, put }) {
      const params = convertQueryParams(payload);
      const { status, response } = yield call(getInvoiceListRq, params);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 作废发票（批量）
    *invalid({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ invoiceList }) => invoiceList);
      const { status, response } = yield call(inValidInvoicesRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '操作成功' });
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
    },
    // 修改归属人（批量）
    *changeOwner({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ invoiceList }) => invoiceList);
      const { ids, ownerId } = payload;
      const { status, response } = yield call(changeOwnerRq, ids, ownerId);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '操作成功' });
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
    },

    // 查询发票详情
    *queryDetail({ payload }, { call, put, select }) {
      const { id } = payload;
      const { status, response } = yield call(invoiceDtlRq, id);

      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        // 格式化数据
        const currentItem = response.datum;
        yield put({
          type: 'updateState',
          payload: {
            currentItem,
          },
        });
      }

      return {};
    },
    // 从百望获取发票信息到发票池
    *getMyInvoiceFromBaiwang({ payload }, { call, put, select }) {
      const { status, response } = yield call(getInvoicesFromBaiwangRq);
      const { searchForm } = yield select(({ invoiceList }) => invoiceList);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '操作成功' });
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
    },
    *delInvoiceFromBaiwang({ payload }, { call, put, select }) {
      const state = yield select(({ invoiceList }) => invoiceList);
      const {
        expenseSearchForm: { invSelected = {} },
      } = yield select(({ invoiceList }) => invoiceList);
      const ids = invSelected.map(v => v.id).join(',');
      console.error('=========================');
      console.error(state);
      console.error(invSelected);
      console.error(ids);
      // const { selectedRowKeys } = payload;
      // const ids = selectedRowKeys.join(',');
      const { response } = yield call(delInvoice, ids);
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
    updateExpenseSearchForm(state, { payload }) {
      const { expenseSearchForm } = state;
      const newFormData = { ...expenseSearchForm, ...payload };
      return {
        ...state,
        expenseSearchForm: newFormData,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        dispatch({
          type: 'updateState',
          payload: { module: pathname },
        });
      });
    },
  },
};
