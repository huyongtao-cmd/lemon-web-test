import { findProjectActivityByProjId, projectActivitySave } from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'userProjectActivity',

  state: {
    dataSource: [],
    deleteList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findProjectActivityByProjId, payload.projId);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },
    *save(payload, { call, select, put }) {
      const { dataSource, deleteList } = yield select(
        ({ userProjectActivity }) => userProjectActivity
      );

      const { status, response } = yield call(projectActivitySave, {
        projId: payload.projId,
        entityList: dataSource,
        deleteIds: deleteList,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        if (response.errorCode) {
          createMessage({ type: 'error', description: response.errorCode });
        } else {
          yield put({
            type: 'query',
            payload: { projId: payload.projId },
          });
          createMessage({ type: 'success', description: '保存成功' });
          // 保存成功之后不让跳了
          // closeThenGoto(`/user/project/projectDetail?id=${payload.projId}`);
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
