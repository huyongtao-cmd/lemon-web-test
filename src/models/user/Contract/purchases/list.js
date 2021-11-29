import router from 'umi/router';
import {
  queryPurchaseContractList,
  queryPurchaseContractListPagenation,
  activityPurchase,
  closePurchase,
  contractListDelRq,
} from '@/services/user/Contract/sales';
import { launchFlowFn } from '@/services/sys/flowHandle';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userContractPurchasesList',

  state: {
    dataSource: [],
    searchForm: {},
    total: null,
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(queryPurchaseContractList, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.datum) ? response.datum : [],
            total: response.total,
          },
        });
      }
    },
    *queryPagenation({ payload }, { call, put, select }) {
      const { response } = yield call(queryPurchaseContractListPagenation, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },

    *actvity({ payload }, { call, put }) {
      const { status, response } = yield call(launchFlowFn, payload);
      if (status === 100) {
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '激活申请中' });
        yield put({ type: 'query' });
      } else {
        createMessage({ type: 'error', description: '提交申请失败' });
      }
    },
    *close({ payload }, { call, put }) {
      const { status, response } = yield call(closePurchase, payload);
      if (status === 100) {
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '关闭成功' });
        yield put({ type: 'query' });
      } else {
        createMessage({ type: 'error', description: response.reason || '关闭失败' });
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(contractListDelRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          const { searchForm } = yield select(
            ({ userContractPurchasesList }) => userContractPurchasesList
          );
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
  },
};
