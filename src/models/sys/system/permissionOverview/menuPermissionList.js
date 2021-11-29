import { menuListUriRq } from '@/services/sys/system/permissionOverview';

const defaultSearchForm = {};

export default {
  namespace: 'menuPermissionList',
  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: undefined,
    userId: null,
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(menuListUriRq, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    // 页签切换时奥球右侧再重新加载
    *againQuery({ payload }, { call, put, select }) {
      const { userId } = yield select(({ menuPermissionList }) => menuPermissionList);
      if (userId) {
        const { response } = yield call(menuListUriRq, { userId });
        if (response) {
          const { rows, total } = response;
          yield put({
            type: 'updateState',
            payload: {
              dataSource: Array.isArray(rows) ? rows : [],
              total,
            },
          });
        }
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          dataSource: [],
          total: 0,
          searchForm: {},
        },
      });
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
        },
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        if (pathname === '/sys/powerMgmt/permissionOverview') {
          dispatch({
            type: 'clean',
          });
        }
        if (pathname === '/user/center/info') {
          dispatch({
            type: 'againQuery',
          });
        }
      });
    },
  },
};
