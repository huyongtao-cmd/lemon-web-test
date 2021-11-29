import {
  paymentSlipListRq,
  batchOperationOperateRq,
} from '@/services/sale/purchaseContract/paymentApplyList';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'payRecordAllList',
  state: {
    list: [],
    total: 0,
    searchForm: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { createTime, ...params } = payload;
      if (Array.isArray(createTime) && (createTime[0] || createTime[1])) {
        [params.purchaseDateStart, params.purchaseDateEnd] = createTime;
      }

      const { status, response } = yield call(paymentSlipListRq, params);
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

    *submitApply({ payload }, { call, put, select }) {
      const { status, response } = yield call(batchOperationOperateRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const { searchForm } = yield select(({ payRecordList }) => payRecordList);
          yield put({
            type: 'query',
            payload: {
              ...searchForm,
              node: 1,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '提交失败' });
        }
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
