import { findLeads, closeLead, submitLeads } from '@/services/user/management/leads';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { launchFlowFn } from '@/services/sys/flowHandle';

export default {
  namespace: 'userLeads',

  state: {
    dataSource: [],
    total: 0,
    searchForm: {},
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findLeads, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    *queryMyLeads({ payload }, { call, put }) {
      // eslint-disable-next-line
      const { response } = yield call(findLeads, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 线索关闭原因
    *saveCloseReason({ payload }, { put, call, select }) {
      const { status, response } = yield call(closeLead, {
        id: payload.id,
        reason: payload.closeReason,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const { searchForm } = yield select(({ userLeads }) => userLeads);
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: searchForm });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 提交流程
    *submit({ payload }, { put, call, select }) {
      const { status, response } = yield call(launchFlowFn, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: { sortBy: 'leadsNo', sortDirection: 'DESC' } });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
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
