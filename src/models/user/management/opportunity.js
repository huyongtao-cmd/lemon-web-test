import moment from 'moment';
import {
  findOppos,
  closeOppo,
  updateOppoActive,
  updateOppoPending,
  updateOppoOpen,
} from '@/services/user/management/opportunity';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

const defaultSearchForm = {
  forecastWinDateRange: '0',
  oppoStatusArry: ['0', 'ACTIVE'],
};

export default {
  namespace: 'userOpportunity',

  state: {
    dataSource: [],
    total: 0,
    searchForm: defaultSearchForm,
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findOppos, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 商机关闭原因
    *saveCloseReason({ payload }, { call, put }) {
      const { status, response } = yield call(closeOppo, {
        id: payload.id,
        reason: payload.closeReason,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: { sortBy: 'id', sortDirection: 'DESC' } });
        yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 商机暂挂激活
    *updateOppoStatus({ payload }, { call, put }) {
      // updateOppoActive, updateOppoPending
      const url = payload && payload.status === 'ACTIVE' ? updateOppoPending : updateOppoActive;
      const { status, response } = yield call(url, { id: payload.id });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload && payload.queryParams });
        yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 重新打开已关闭的商机
    *reStartOppoStatus({ payload }, { call, put }) {
      const { id } = payload;
      const { status, response } = yield call(updateOppoOpen, { id });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload && payload.queryParams });
        yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
  },
};
