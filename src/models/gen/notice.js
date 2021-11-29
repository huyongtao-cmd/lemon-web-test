import { queryProjectNotice } from '@/services/gen/app';

/**
 * 系统消息模块
 */
export default {
  namespace: 'notice',

  state: {
    notice: [],
  },

  effects: {
    *fetchNotice(_, { call, put }) {
      const { response } = yield call(queryProjectNotice);
      yield put({
        type: 'saveNotice',
        payload: Array.isArray(response) ? response : [],
      });
    },
  },

  reducers: {
    saveNotice(state, action) {
      return {
        ...state,
        notice: action.payload,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      // return history.listen(({ pathname, search }) => {
      //   dispatch({
      //     type: 'fetchCsrf',
      //   });
      // });
    },
  },
};
