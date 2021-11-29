import { buWithdrawPayDetail } from '@/services/user/equivalent/equivalent';

import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';

export default {
  namespace: 'buWithdrawPayDetail',
  state: {
    formData: {},
    dataSource: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(buWithdrawPayDetail, payload);
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
