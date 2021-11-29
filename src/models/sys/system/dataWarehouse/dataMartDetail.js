import { dataMartDetail } from '@/services/sys/system/dataWarehouse';

export default {
  namespace: 'dataMartDetail',
  state: {
    formData: {},
    dataSource: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(dataMartDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            dataSource: response.dtlViews,
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
