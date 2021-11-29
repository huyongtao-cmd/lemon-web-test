import { queryWithdrawPayDetail } from '@/services/user/equivalent/equivalent';
import { getViewConf } from '@/services/gen/flow';

export default {
  namespace: 'withdrawPayDetail',
  state: {
    formData: {},
    dataSource: [],
    withdrawPayFlow: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryWithdrawPayDetail, payload);
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
