import { taskTmplDetail } from '@/services/user/task/task';

export default {
  namespace: 'taskTmplDetail',
  state: {
    formData: {},
    dataSource: [],
    withdrawPayFlow: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(taskTmplDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            dataSource: response.dtlViews,
            withdrawPayFlow: response.reimIds ? response.reimIds.split(',') : [],
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
