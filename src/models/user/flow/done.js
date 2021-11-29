import { getDone } from '@/services/user/flow/flow';

const defaultSearchForm = {
  no: undefined,
  name: undefined,
  info: undefined,
  startTime: undefined,
  initiatorName: undefined,
  defId: undefined,
};

export default {
  namespace: 'flowDone',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { sinceDate, untilDate, done } = payload;
      const params = { ...payload };
      if (sinceDate && typeof sinceDate !== 'string') {
        params.sinceDate = sinceDate.format('YYYY-MM-DD');
      }
      if (untilDate && typeof untilDate !== 'string') {
        params.untilDate = untilDate.format('YYYY-MM-DD');
      }
      if (done === 'all') {
        delete params.done;
      }
      const { response, status } = yield call(getDone, params);
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
