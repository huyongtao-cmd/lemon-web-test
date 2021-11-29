import { queryWeekStart } from '@/services/user/timesheet/timesheet';
import moment from 'moment';

export default {
  namespace: 'userMyTimesheet',

  state: {
    date: moment(),
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const date = payload && payload.date ? payload.date : null;
      const workDateFrom = moment(date)
        .startOf('month')
        .startOf('week')
        .format('YYYY-MM-DD');
      const workDateTo = moment(date)
        .endOf('month')
        .endOf('week')
        .format('YYYY-MM-DD');

      const { response } = yield call(queryWeekStart, {
        workDateFrom,
        workDateTo,
        offset: 0,
        limit: 0,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
            date,
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
