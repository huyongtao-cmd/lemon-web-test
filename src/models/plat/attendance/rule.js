import { ruleList, ruleDel } from '@/services/plat/attendance/attendance';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'platAttendanceRule',

  state: {
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(ruleList, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },

    *del({ payload }, { call, put }) {
      const { response } = yield call(ruleDel, payload);
      if (response.ok) {
        yield put({ type: 'query' });
        createMessage({ type: 'success', description: '删除成功' });
      } else {
        createMessage({ type: 'error', description: '删除失败' });
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
