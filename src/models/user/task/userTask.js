import createMessage from '@/components/core/AlertMessage';
import router from 'umi/router';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

import {
  cancelTask,
  queryUserTasks,
  reopenTask,
  checkDist,
  deleteUserTasksByIds,
  closeTasks,
} from '@/services/user/task/task';

export default {
  namespace: 'userTask',

  state: {
    // 查询系列
    searchForm: {},
    dataSource: [],
    total: 0,
    pageConfig: null,
    // 任务状态变更
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(queryUserTasks, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },

    // 派发
    // *distribute({ payload }, { call, put }) {},

    // 变更
    // *change({ payload }, { call, put }) {},

    // 暂挂
    *pending({ payload }, { call, put }) {
      const { response } = yield call(cancelTask, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '暂挂成功' });
        yield put({
          type: 'query',
          payload: payload.searchForm,
        });
      }
    },

    // 关闭
    // *close({ payload }, { call, put }) {},

    // 重新打开
    *reopen({ payload }, { call, put }) {
      const { response } = yield call(reopenTask, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '激活成功' });
        yield put({
          type: 'query',
          payload: payload.searchForm,
        });
      }
    },

    // 判断是否可以派发
    *checkDist({ payload }, { call, put }) {
      const { status, response } = yield call(checkDist, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        router.push(`/user/distribute/create?taskId=${payload.id}`);
      } else {
        createMessage({ type: 'error', description: response.reason || '不满足派发条件' });
      }
    },
    *close({ payload }, { call, put }) {
      const { status, response } = yield call(closeTasks, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '任务关闭成功' });
        yield put({
          type: 'query',
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '不满足关闭条件' });
      }
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
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
