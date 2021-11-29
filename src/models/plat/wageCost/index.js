import { queryWageCostList, delWageCostItem, getViewWageCost } from '@/services/plat/wageCost';
import createMessage from '@/components/core/AlertMessage';
import { selectIamUsers } from '@/services/gen/list';

const defaultSearchForm = {};

export default {
  namespace: 'wageCostModels',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    resDataSource: [],
    filtersParams: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          filtersParams: { ...payload },
        },
      });
      const { response } = yield call(queryWageCostList, payload);
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
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectIamUsers);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
          resDataSource: list,
        },
      });
    },
    *del({ payload }, { put, call, select }) {
      const rep = yield call(delWageCostItem, payload);
      const { filtersParams } = yield select(({ wageCostModels }) => wageCostModels);
      if (rep && rep.response && rep.response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: filtersParams });
      } else {
        createMessage({ type: 'error', description: rep.response.reason });
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
