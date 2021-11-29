import { queryRecvplanDetail } from '@/services/plat/recv/Contract';

export default {
  namespace: 'platRecvDetail',
  state: {
    formData: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryRecvplanDetail, payload);
      const { datum = {} } = response;
      yield put({
        type: 'updateState',
        payload: {
          formData: datum,
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
