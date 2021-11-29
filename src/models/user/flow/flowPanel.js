import { getFlowDataFn } from '@/services/user/flow/flow';

export default {
  namespace: 'flowPanel',
  state: {},
  effects: {
    *getFlowData({ payload }, { call, select, put }) {
      const { response, status } = yield call(getFlowDataFn);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            flowDatas: response,
          },
        });
      }
      return response;
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
