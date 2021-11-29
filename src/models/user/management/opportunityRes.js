// import { findOppos } from '@/services/user/management/opportunity';

export default {
  namespace: 'userOppsDetailres',

  state: {
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      // const { response } = yield call(findOppoById, payload.id);
      // yield put({
      //   type: 'updateState',
      //   payload: {
      //     dataSource: response.rows,
      //     total: response.total,
      //   },
      // });
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
