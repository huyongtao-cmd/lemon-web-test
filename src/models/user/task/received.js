import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import {
  queryReceivedTasks,
  startResActivity,
  finishResActivity,
  startCompleteProc,
  checkTaskEqva,
} from '@/services/user/task/received';

export default {
  namespace: 'userTaskReceived',

  state: {
    // 查询系列
    searchForm: {},
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryReceivedTasks, payload);
      if (response) {
        const rows = Array.isArray(response.rows) ? response.rows : [];
        yield put({
          type: 'updateState',
          payload: {
            dataSource: rows.map(item => {
              // 解决 children 的 id 跟父级重复的问题
              const children = item.children
                ? item.children.map(value => ({ ...value, id: item.id + '-' + value.id }))
                : [];
              return { ...item, children1: children, children: undefined };
            }),
            total: response.total,
          },
        });
      }
    },

    *startResAct({ payload }, { call, put }) {
      const { response } = yield call(startResActivity, payload);
      if (response) {
        yield put({
          type: 'query',
          payload: {},
        });
      }
    },

    *finishResAct({ payload }, { call, put }) {
      const { response } = yield call(finishResActivity, payload);
      if (response) {
        if (response.errCode === 'NG_TASK_RES_ACTIVITY_FINISH_NEED_APPROVE') {
          // 完工需要审批,跳转完工申请流程
          router.push('/user/task/resActFinish?id=' + payload.resActId);
        }
        yield put({
          type: 'query',
          payload: {},
        });
      }
    },
    *checkTaskEqva({ payload }, { call }) {
      const { response } = yield call(checkTaskEqva, payload);
      return response;
    },
    *startCompleteProc({ payload }, { call }) {
      const { response } = yield call(startCompleteProc, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
      } else {
        createMessage({ type: 'error', description: response.reason });
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
