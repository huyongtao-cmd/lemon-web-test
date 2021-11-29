import { queryMonthList, ruleList, exportMonthExcel } from '@/services/plat/attendance/attendance';

export default {
  namespace: 'platAttendanceRecordMonth',

  state: {
    dataSource: [],
    searchForm: {
      month: [],
    },
    total: 0,
    ruleList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        month: [attendanceDateStart, attendanceDateEnd],
      } = payload;
      const parm = {
        ...payload,
        attendanceDateStart,
        attendanceDateEnd,
      };
      if (parm.month) {
        delete parm.month;
      }
      const { response } = yield call(queryMonthList, parm);
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
    *exportMonthExcelFn({ payload }, { call, put, select }) {
      const { searchForm } = yield select(
        ({ platAttendanceRecordMonth }) => platAttendanceRecordMonth
      );
      const {
        month: [attendanceDateStart, attendanceDateEnd],
      } = searchForm;
      const parm = {
        ...searchForm,
        attendanceDateStart,
        attendanceDateEnd,
      };
      if (parm.month) {
        delete parm.month;
      }
      const { response } = yield call(exportMonthExcel, parm);
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
