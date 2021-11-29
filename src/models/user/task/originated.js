import { queryOriginatedTasks } from '@/services/user/task/originated';
import { deleteUserTasksByIds, closeTasks } from '@/services/user/task/task';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userTaskOriginated',

  state: {
    // 查询系列
    searchForm: {},
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(queryOriginatedTasks, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },
    *close({ payload }, { call, put }) {
      const { status, response } = yield call(closeTasks, payload);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '任务关闭成功' });
        yield put({
          type: 'query',
        });
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '不满足关闭条件' });
      return false;
    },
    *delete({ payload }, { call, put }) {
      const { status, response } = yield call(deleteUserTasksByIds, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '任务删除成功' });
        yield put({
          type: 'query',
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '不满足删除条件' });
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
