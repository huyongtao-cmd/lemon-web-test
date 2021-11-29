import {
  abNormalRuleList,
  abNormalRuleDel,
  abNormalRuleSwitch,
} from '@/services/plat/attendance/attendance';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'attendanceAbnormalRule',

  state: {
    dataSource: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(abNormalRuleList, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },

    *del({ payload }, { call, put }) {
      const { response } = yield call(abNormalRuleDel, payload);
      if (response.ok) {
        yield put({ type: 'query' });
        createMessage({ type: 'success', description: '删除成功' });
      } else {
        createMessage({ type: 'error', description: '删除失败' });
      }
    },

    *switch({ payload }, { call, put }) {
      const { response } = yield call(abNormalRuleSwitch, payload);
      if (response.ok) {
        yield put({ type: 'query' });
        createMessage({ type: 'success', description: '更新成功' });
      } else {
        createMessage({ type: 'error', description: '更新失败' });
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
