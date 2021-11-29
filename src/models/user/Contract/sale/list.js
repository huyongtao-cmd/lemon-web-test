import {
  queryContractList,
  updateContractStatus,
  removeContactList,
  resetProfitResult,
  passAccountRq,
  getNormSettleByContIdRq,
} from '@/services/user/Contract/sales';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { isEmpty } from 'ramda';

export default {
  namespace: 'userContractSaleList',

  state: {
    dataSource: [],
    searchForm: {},
    total: null,
    pageConfig: {},
    amtSettleFormData: {},
    amtSettleList: [],
  },

  effects: {
    *getNormSettleByContId({ payload }, { call, put, select }) {
      const { status, response } = yield call(getNormSettleByContIdRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200 && response.ok) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            amtSettleFormData: Array.isArray(datum) && !isEmpty(datum) ? datum[0] : {},
            amtSettleList: Array.isArray(datum) ? datum : [],
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: '查询失败' });
      return {};
    },
    *passAccount({ payload }, { call, put, select }) {
      const { status, response } = yield call(passAccountRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        return response;
      }
      createMessage({ type: 'error', description: '操作失败' });
      return {};
    },

    *query({ payload }, { call, put, select }) {
      const { response } = yield call(queryContractList, payload);
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
    // 激活
    *active({ payload }, { call, put, select, searchForm }) {
      const { status, response } = yield call(updateContractStatus, {
        id: payload.id,
        status: payload.status,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        if (payload.status === 'PENDING') {
          createMessage({ type: 'success', description: '挂起成功' });
        } else {
          createMessage({ type: 'success', description: '激活成功' });
        }
        yield put({
          type: 'query',
          payload: payload.searchForm,
        });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 删除
    *remove({ payload }, { call, put }) {
      const { status, response } = yield call(removeContactList, {
        ids: payload.ids,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        yield put({
          type: 'query',
          payload: payload.searchForm,
        });
      } else {
        createMessage({ type: 'error', description: '删除失败' });
      }
    },
    // 删除
    *resetProfitResult({ payload }, { call, put }) {
      const { status, response } = yield call(resetProfitResult, {
        ids: payload.ids,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: response.reason });
        yield put({
          type: 'query',
          payload: payload.searchForm,
        });
      } else {
        createMessage({ type: 'error', description: response.reason });
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
