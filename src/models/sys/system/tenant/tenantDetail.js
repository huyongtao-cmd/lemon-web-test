import { tenantDetail } from '@/services/sys/system/tenant';

export default {
  namespace: 'tenantDetail',
  state: {
    formData: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(tenantDetail, payload);
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
