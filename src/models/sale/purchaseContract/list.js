import { isEmpty } from 'ramda';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import {
  purchaseList,
  purchasePending,
  purchaseActive,
  purchaseOverSubmit,
  remove,
} from '@/services/sale/purchaseContract/purchaseContract';
import { queryProdClassesTree } from '@/services/sys/baseinfo/product';
import { queryUserPrincipal } from '@/services/gen/user';
import { launchFlowFn } from '@/services/sys/flowHandle';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

export default {
  namespace: 'salePurchaseList',
  state: {
    listData: [],
    searchForm: {},
    total: 0,
    treeData: [],
    user: {},
    params: {},
    pageConfig: {},
  },
  effects: {
    /* 获取采购合同详情 */
    *queryList({ payload }, { call, put, select }) {
      const { response } = yield call(purchaseList, payload);
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
      const { response } = yield call(purchasePending, payload);
      const { params } = yield select(({ salePurchaseList }) => salePurchaseList);
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
      const { response } = yield call(purchaseActive, payload);
      const { params } = yield select(({ salePurchaseList }) => salePurchaseList);
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

    *tree({ payload }, { call, put }) {
      const mergeDeep = child =>
        Array.isArray(child)
          ? child.map(item => ({
              ...item,
              title: item.className,
              key: item.id,
              value: item.id,
              children: item.child ? mergeDeep(item.child) : [],
            }))
          : [];

      const { response } = yield call(queryProdClassesTree, payload);
      yield put({
        type: 'updateState',
        payload: {
          treeData: mergeDeep(Array.isArray(response) ? response : []),
        },
      });
    },

    *close({ payload }, { call, put, select }) {
      let defkey = '';
      const { response } = yield call(purchaseOverSubmit, payload);
      if (response && response.ok) {
        payload.purchaseType === 'CONTRACT' ? (defkey = 'TSK_S09') : (defkey = 'TSK_S11');
        const { response: responseFlow } = yield call(launchFlowFn, {
          defkey,
          value: {
            id: response.datum.id,
          },
        });
        if (responseFlow && responseFlow.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/user/flow/process?type=procs&refresh=${moment().valueOf()}`);
        } else {
          createMessage({
            type: 'error',
            description: `提交失败,错误原因：${responseFlow.reason}`,
          });
        }
      } else {
        createMessage({ type: 'error', description: `提交失败,错误原因：${response.reason}` });
      }
    },

    *remove({ payload }, { call, put, select }) {
      const { response } = yield call(remove, payload);
      const { params } = yield select(({ salePurchaseList }) => salePurchaseList);
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
        treeData: [],
        user: {},
        params: {},
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
