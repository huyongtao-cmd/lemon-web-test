import { getCertApplyList } from '@/services/user/growth';

export default {
  namespace: 'growthRecordCertificate',

  state: {
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getCertApplyList, payload);
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
