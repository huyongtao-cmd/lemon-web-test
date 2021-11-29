import { prefexamListRq } from '@/services/plat/communicate';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'communicate',
  state: {
    list: [],
    total: 0,
    searchForm: {},
    resDataSource: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { applyRange, ...params } = payload;
      console.log(payload, 'payload');
      if (Array.isArray(applyRange) && applyRange[0] && applyRange[1]) {
        [params.applyStartDate, params.applyEndDate] = applyRange;
      }
      const { status, response } = yield call(prefexamListRq, params);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
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
          selectedRowKeys: [],
        },
      };
    },
  },
};
