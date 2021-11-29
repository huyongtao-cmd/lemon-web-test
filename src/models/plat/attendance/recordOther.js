import { queryOtherList } from '@/services/plat/attendance/attendance';

export default {
  namespace: 'platAttendanceRecordOther',

  state: {
    dataSource: [],
    searchForm: {
      time: [],
    },
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        time: [startTime, endTime],
      } = payload;
      const parm = {
        ...payload,
        startTime,
        endTime,
      };
      const { response } = yield call(queryOtherList, parm);
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
