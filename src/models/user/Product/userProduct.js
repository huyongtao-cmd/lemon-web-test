import {
  queryProduct,
  queryProductCase,
  queryProductionVideo,
} from '@/services/user/Product/userProduct';

export default {
  namespace: 'userProduct',

  state: {
    list: [],
    total: 0,
    detail: null,
    caseList: [],
    videoUrl: undefined,
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const { response } = yield call(queryProduct, payload);
      yield put({
        type: 'updateState',
        payload: {
          list: Array.isArray(response) ? response : [],
          total: response.length,
        },
      });
    },
    *fetchDetail({ payload }, { call, put }) {
      const { response } = yield call(queryProduct, payload);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          detail: list[0] || {},
        },
      });
    },
    *fetchCase({ payload }, { call, put }) {
      const { response } = yield call(queryProductCase, payload);
      yield put({
        type: 'updateState',
        payload: {
          caseList: Array.isArray(response) ? response : [],
        },
      });
    },
    *fetchVideoUrl({ payload }, { call, put }) {
      const res = yield call(queryProductionVideo, payload);
      if (res.response) {
        yield put({
          type: 'updateState',
          payload: {
            videoUrl: res.response,
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

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {});
    },
  },
};
