import { formatDT } from '@/utils/tempUtils/DateTime';
import { queryBriefInfoLogicalDetail } from '@/services/user/project/project';
import { selectFinperiod } from '@/services/user/Contract/sales';

export default {
  namespace: 'projectReportDetail',
  state: {
    formData: {
      reprotCompPercent: 0,
      confirmCompPercent: 0,
      confirmAmt: 0,
    },
    confirmedAmt: 0,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryBriefInfoLogicalDetail, payload);
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
