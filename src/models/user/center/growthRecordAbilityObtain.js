import { getCapaSetApplyList, queryCapaInfo } from '@/services/user/growth';

export default {
  namespace: 'growthRecordAbilityObtain',

  state: {
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getCapaSetApplyList, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.rows,
            total: response.total,
          },
        });
      }
    },
    *queryCapaset({ payload }, { call, put, select }) {
      const { response } = yield call(queryCapaInfo);
      yield put({
        type: 'updateState',
        payload: {
          capasetData: Array.isArray(response.datum) ? response.datum : [],
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
