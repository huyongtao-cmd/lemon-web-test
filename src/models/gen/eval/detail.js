import { queryEvalDetail } from '@/services/gen/eval';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

/**
 * 系统用户信息状态
 */
export default {
  namespace: 'evalDetailModal',

  state: {
    formData: {},
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryEvalDetail, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
            dataSource: response.datum.itemList || [],
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
