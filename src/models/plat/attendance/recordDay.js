import { queryDayList, ruleList } from '@/services/plat/attendance/attendance';

export default {
  namespace: 'platAttendanceRecordDay',

  state: {
    dataSource: [],
    searchForm: {
      date: [],
    },
    total: 0,
    ruleList: [],
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
    *queryRuleList({ payload }, { call, put }) {
      const params = {
        offset: 0,
        limit: 100,
      };
      const { response } = yield call(ruleList, params);
      yield put({
        type: 'updateState',
        payload: {
          ruleList: Array.isArray(response.rows) ? response.rows : [],
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
