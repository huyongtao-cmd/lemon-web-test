import { dataWarehouseTableDetail } from '@/services/sys/system/dataWarehouse';

export default {
  namespace: 'dataWarehouseTableDetail',
  state: {
    formData: {},
    dataSource: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(dataWarehouseTableDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            dataSource: response.detailViews,
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
