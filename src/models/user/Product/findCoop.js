import { cooperativeListRq, coopDetailRq } from '@/services/user/Product/userProduct';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  coopStatus: 'ACTIVITY',
};

export default {
  namespace: 'findCoop',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: {},
    twBuProdView: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(cooperativeListRq, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(coopDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { twBuProdView, ...NewformData } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              formData: NewformData,
              twBuProdView,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
        list: [],
        total: 0,
      };
    },
  },
};
