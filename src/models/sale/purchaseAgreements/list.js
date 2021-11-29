import { isEmpty } from 'ramda';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import {
  queryList,
  active,
  pending,
  over,
  remove,
} from '@/services/sale/purchaseAgreement/purchaseAgreement';
import { queryUserPrincipal } from '@/services/gen/user';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'salePurchaseAgreementsList',
  state: {
    listData: [],
    searchForm: {},
    total: 0,
    params: {},
    user: {},
    pageConfig: {},
  },
  effects: {
    /* 获取采购合同详情 */
    *queryList({ payload }, { call, put, select }) {
      const { response } = yield call(queryList, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listData: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
            params: payload,
          },
        });
      }
    },
    // 暂挂
    *pending({ payload }, { call, put, select }) {
      const { response } = yield call(pending, payload);
      const { params } = yield select(
        ({ salePurchaseAgreementsList }) => salePurchaseAgreementsList
      );
      if (response && response.ok) {
        createMessage({ type: 'success', description: '暂挂成功' });
        yield put({
          type: 'queryList',
          payload: params,
        });
      } else {
        createMessage({ type: 'error', description: `暂挂失败,错误原因：${response.reason}` });
      }
    },
    // 激活
    *active({ payload }, { call, put, select }) {
      const { response } = yield call(active, payload);
      const { params } = yield select(
        ({ salePurchaseAgreementsList }) => salePurchaseAgreementsList
      );
      if (response && response.ok) {
        createMessage({ type: 'success', description: '激活成功' });
        yield put({
          type: 'queryList',
          payload: params,
        });
      } else {
        createMessage({ type: 'error', description: `激活失败,错误原因：${response.reason}` });
      }
    },

    *over({ payload }, { call, put, select }) {
      const { response } = yield call(over, payload);
      const { params } = yield select(
        ({ salePurchaseAgreementsList }) => salePurchaseAgreementsList
      );
      if (response && response.ok) {
        createMessage({ type: 'success', description: '终止成功' });
        yield put({
          type: 'queryList',
          payload: params,
        });
      } else {
        createMessage({ type: 'error', description: `终止失败,错误原因：${response.reason}` });
      }
    },

    *remove({ payload }, { call, put, select }) {
      const { response } = yield call(remove, payload);
      const { params } = yield select(
        ({ salePurchaseAgreementsList }) => salePurchaseAgreementsList
      );
      if (response && response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        yield put({
          type: 'queryList',
          payload: params,
        });
      } else {
        createMessage({ type: 'error', description: `删除失败,错误原因：${response.reason}` });
      }
    },

    *fetchPrincipal(_, { call, put }) {
      const { response } = yield call(queryUserPrincipal);
      // 缓存前端用户信息
      yield put({
        type: 'updateState',
        payload: {
          user: response,
        },
      });
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
    clear(state, { payload }) {
      return {
        ...state,
        listData: [],
        searchForm: {},
        total: 0,
        params: {},
        user: {},
        pageConfig: {},
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
