import { queryRemarkList, updateRemarkStatusHandle } from '@/services/plat/attendance/attendance';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'orgAttendanceRecordAbnormal',

  state: {
    dataSource: [],
    searchForm: {
      time: [],
      status: 'APPROVAL_PENDING',
      frozen: 0,
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
      };
      if (startTime && endTime) {
        parm.startDate = startTime;
        parm.endDate = endTime;
      }
      delete parm.time;
      const { response } = yield call(queryRemarkList, parm);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },
    *updateRemarkStatusHandleFn({ payload }, { call, put, select }) {
      const { response } = yield call(updateRemarkStatusHandle, payload);
      const { searchForm } = yield select(
        ({ orgAttendanceRecordAbnormal }) => orgAttendanceRecordAbnormal
      );
      if (response && response.ok) {
        createMessage({ type: 'success', description: response.reason || '操作成功' });
        yield put({
          type: 'query',
          payload: searchForm,
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
