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
    [params.invoiceDateStart, params.invoiceDateEnd] = params.invoiceDate;
    params.invoiceDate = void 0;
  }
  return params;
};

export default {
  namespace: 'invoice',
  state: {
    module: '', // 所属模块
    list: [],
    total: 0,
    searchForm: {},
    currentItem: {},
    pageConfig: null,
    detailPageConfig: null,
  },

  effects: {
    // 报销单用查询发票列表 -- 千万不要干掉
    *queryExpense({ payload }, { call, put }) {
      const params = convertQueryParams(payload);
      const { status, response } = yield call(getInvoiceListRq, params);
      if (status === 200 && response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '查询失败' });
      return null;
    },

    // 从百望获取发票信息到发票池
    *getMyInvoiceModalFromBaiwang({ payload }, { call, put, select }) {
      const { status, response } = yield call(getInvoicesFromBaiwangRq);
      if (status === 200 && response && response.ok) {
        createMessage({ type: 'success', description: response.reason || '同步成功' });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '同步失败' });
      return response;
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

    //删除发票
    *delInvoiceFromBaiwang({ payload }, { call, put, select }) {
      const { status, response } = yield call(delInvoice, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: response.reason || '操作成功' });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return response;
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
