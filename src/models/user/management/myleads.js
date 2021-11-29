import { findLeads } from '@/services/user/management/leads';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'userMyLeads',

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
