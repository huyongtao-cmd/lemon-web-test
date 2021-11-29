import { workReportDetail } from '@/services/user/weeklyReport/weeklyReport';

export default {
  namespace: 'workReportDetail',
  state: {
    formData: {},
    dataSource: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      console.log('qqassdfaaaaaaaaaaaaaaa', payload);
      const { status, response } = yield call(workReportDetail, payload);
      console.log(response);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum,
            dataSource: response.datum.logListViewList || [],
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
