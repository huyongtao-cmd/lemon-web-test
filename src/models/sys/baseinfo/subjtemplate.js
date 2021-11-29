import {
  findSubjtemplates,
  deleteSubjtemplate,
  updateSubjtempStatus,
} from '@/services/sys/baseinfo/subjtemplate';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysSubjTemplate',

  state: {
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findSubjtemplates, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 删除
    *delete({ payload }, { put, call }) {
      const { status, response } = yield call(deleteSubjtemplate, payload.id);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else {
        createMessage({
          type: 'error',
          description: '`' + response.datum.join('、') + '`' + response.reason,
        });
      }
    },
    // 激活ACTIVE/不激活INACTIVE
    *active({ payload }, { put, call }) {
      yield call(updateSubjtempStatus, payload);
      yield put({ type: 'query', payload: payload.queryParams });
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
