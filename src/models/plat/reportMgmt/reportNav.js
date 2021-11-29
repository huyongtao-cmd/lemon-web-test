import { queryReportNav } from '@/services/sys/system/report';

export default {
  namespace: 'reportNav',
  state: {
    source: [],
  },
  effects: {
    *query(_, { call, put }) {
      const { status, response } = yield call(queryReportNav);
      if (status === 100) return;
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            source: Array.isArray(response.datum) ? response.datum : [],
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
  },
};
