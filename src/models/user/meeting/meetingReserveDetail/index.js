/* eslint-disable no-nested-ternary */
import { getReservedRoomListByWeek } from '@/services/user/meeting';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

export default {
  namespace: 'meetingReserveDetail',
  state: {
    list: [],
    total: 0,
    searchForm: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { startDate, endDate } = payload;
      const { status, response } = yield call(getReservedRoomListByWeek, startDate, endDate);
      if (status === 200) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(datum) ? datum : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
