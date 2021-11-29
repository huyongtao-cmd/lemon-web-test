import { taskMultiDetail } from '@/services/user/task/task';

export default {
  namespace: 'taskMultiDetail',
  state: {
    formData: {},
    dataSource: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(taskMultiDetail, payload);
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
