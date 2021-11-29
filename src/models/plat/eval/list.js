import { evalList } from '@/services/plat/eval';
import { queryEvalDetail } from '@/services/gen/eval';
import createMessage from '@/components/core/AlertMessage';
const defaultSearchForm = {};

export default {
  namespace: 'platEvalList',
  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: null,
    source: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      console.warn(payload);
      const parm = {
        ...payload,
        evalDateForm: payload.evalDate && payload.evalDate[0],
        evalDateTo: payload.evalDate && payload.evalDate[2],
        averageScoreForm: payload.averageScore && payload.averageScore[0],
        averageScoreTo: payload.averageScore && payload.averageScore[2],
      };
      delete parm.evalDate;
      delete parm.averageScore;

      const { response } = yield call(evalList, parm);
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
    *detail({ payload }, { call, put }) {
      const { status, response } = yield call(queryEvalDetail, payload);
      if (status === 100) return;
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            source: response.datum || {},
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
