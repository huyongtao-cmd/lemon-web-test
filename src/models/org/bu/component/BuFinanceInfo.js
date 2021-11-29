import { findbuAcc } from '@/services/org/bu/bu';

export default {
  namespace: 'orgBuAcc',

  state: {},

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findbuAcc, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(response.datum) ? response.datum : [],
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
  },
};
