import { getHomeConfigListNav, getMenuList, deleteMenuFn } from '@/services/sys/system/homeConfig';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultSearchForm = {};

export default {
  namespace: 'homeConfigMenuList',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(getMenuList, payload);
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
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *queryNav({ payload }, { call, put }) {
      const { status, response } = yield call(getHomeConfigListNav, payload);
      if (status === 200) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            HomeConfigListNav: Array.isArray(datum) ? datum : [],
          },
        });
      } else {
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(deleteMenuFn, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          yield put({
            type: 'query',
          });
        } else {
          const message = response.reason || '操作失败';
          createMessage({ type: 'warn', description: message });
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
