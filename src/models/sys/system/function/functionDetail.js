import { systemFunctionDetail } from '@/services/sys/system/function';

export default {
  namespace: 'functionDetail',
  state: {
    formData: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(systemFunctionDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
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
