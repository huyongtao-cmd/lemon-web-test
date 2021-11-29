import { findTaskChangeHistory, findTaskChangeDetails } from '@/services/user/task/change';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userTaskChangeHistory',

  state: {
    dataList: [],
    changeList: [],
    formData: {},
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          dataList: [],
          changeList: [],
          formData: {},
        },
      });
    },

    // 查询任务包变更历史列表
    *query({ payload }, { call, put }) {
      // taskId
      const { status, response } = yield call(findTaskChangeHistory, payload.id);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            dataList: Array.isArray(response.rows) ? response.rows : [],
          },
        });
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '查询失败' });
      }
    },

    // 根据changeId查询变更明细列表
    *queryDetails({ payload }, { call, put }) {
      // changeId
      const { status, response } = yield call(findTaskChangeDetails, payload.id);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            changeList: Array.isArray(response) ? response : [],
            formData: payload.formData || {},
          },
        });
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '查询失败' });
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
