import { queryMonthList, exportMonthExcel } from '@/services/plat/attendance/attendance';

export default {
  namespace: 'orgAttendanceRecordMonth',

  state: {
    dataSource: [],
    searchForm: {
      month: [],
    },
    total: 0,
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
        isBuCheck: 1,
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
    *exportMonthExcelFn({ payload }, { call, put, select }) {
      const { searchForm } = yield select(
        ({ orgAttendanceRecordMonth }) => orgAttendanceRecordMonth
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
