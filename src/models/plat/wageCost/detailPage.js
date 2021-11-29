import { detaulQuery, payObjQuery, buQuery } from '@/services/plat/wageCostDetail';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};

export default {
  namespace: 'wageCostDetailPage',
  state: {
    detailList: [],
    detailTotal: 0,
    payobjList: [],
    payObjTotal: 0,
    buList: [],
    buTotal: 0,
  },

  effects: {
    // 详情页面查询
    *detailListQuery({ payload }, { call, put }) {
      const { response } = yield call(detaulQuery, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            detailList: Array.isArray(rows) ? rows : [],
            detailTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.response.reason });
      }
    },
    // 付款对象查询
    *payObjListQuery({ payload }, { call, put, select }) {
      const { response } = yield call(payObjQuery, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            payobjList: Array.isArray(rows) ? rows : [],
            payObjTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.response.reason });
      }
    },
    // BU成本查询
    *buListQuery({ payload }, { put, call, select }) {
      const { response } = yield call(buQuery, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            buList: Array.isArray(rows) ? rows : [],
            buTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.response.reason });
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
      };
    },
  },
};
