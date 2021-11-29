/* eslint-disable consistent-return */
/* eslint-disable prefer-const */
/* eslint-disable no-nested-ternary */
import moment from 'moment';
import {
  getPaymentApplyList,
  deletePaymentApply,
} from '@/services/sale/purchaseContract/paymentApplyList';
import createMessage from '@/components/core/AlertMessage';

const convertQueryParams = queryParams => {
  if (queryParams === void 0) return;
  let params = queryParams;
  if (params.createTime) {
    params.createTimeStart = params.createTime[0].format('YYYY-MM-DD');
    params.createTimeEnd = params.createTime[1].format('YYYY-MM-DD');
    params.createTime = void 0;
  }
  return params;
};

export default {
  namespace: 'paymentApplyList',
  state: {
    list: [],
    total: 0,
    searchForm: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const params = convertQueryParams(payload);
      const newPayload = {
        ...params,
        sortBy: (params && params.sortBy) || 'id',
        sortDirection: (params && params.sortDirection) || 'DESC',
      };
      const { status, response } = yield call(getPaymentApplyList, newPayload);
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
    *delete({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ paymentApplyList }) => paymentApplyList);
      const { status, response } = yield call(deletePaymentApply, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }

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
};
