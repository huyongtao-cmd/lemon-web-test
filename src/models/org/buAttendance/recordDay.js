import { queryDayList } from '@/services/plat/attendance/attendance';

export default {
  namespace: 'orgAttendanceRecordDay',

  state: {
    dataSource: [],
    searchForm: {
      date: [],
    },
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        date: [attendanceDateStart, attendanceDateEnd],
      } = payload;
      const parm = {
        ...payload,
        attendanceDateStart,
        attendanceDateEnd,
        isBuCheck: 1,
      };
      const { response } = yield call(queryDayList, parm);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },
};
