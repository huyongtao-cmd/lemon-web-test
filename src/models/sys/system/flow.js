import { queryProcs, unloadFlow } from '@/services/sys/flowMgmt';

const defaultSearchForm = {
  keyLike: undefined,
  nameLike: undefined,
};

export default {
  namespace: 'flowMgmt',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(queryProcs, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },
    *unload({ payload }, { call, put }) {
      // TODO: 以后会分成 弱删除 和 强删除，弱删除删不掉之后，弹窗告知是否要强制删除，因为在删除操作的时候，流程实例可能还在跑
      const { status } = yield call(unloadFlow, payload.id);
      if (status === 200) {
        yield put({ type: 'query' });
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
        searchForm: defaultSearchForm,
      };
    },
  },
};
