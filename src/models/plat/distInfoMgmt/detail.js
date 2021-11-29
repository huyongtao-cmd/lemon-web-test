import { queryDitInfoDetail } from '@/services/plat/distInfoMgmt';

export default {
  namespace: 'distInfoDetail',
  state: {
    list: [],
    total: 0,
    formData: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryDitInfoDetail, payload);
      if (response) {
        const { datum = {} } = response;
        const { profitdistResults, ...formData } = datum;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(profitdistResults) ? profitdistResults : [],
            total: profitdistResults.length,
            formData,
          },
        });
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
  },
};
