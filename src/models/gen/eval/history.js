import { queryEvalList } from '@/services/gen/eval';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

/**
 * 系统用户信息状态
 */
export default {
  namespace: 'evalHistory',

  state: {
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryEvalList, payload);
      if (status === 100) return;
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
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
  },
};
