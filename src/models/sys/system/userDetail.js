import { findUserById, getUserRaabs } from '@/services/sys/iam/users';

export default {
  namespace: 'sysuserDetail',

  state: {
    raabs: [],
    formData: {
      type: undefined,
      name: undefined,
      login: undefined,
      title: undefined,
      password: undefined,
      roles: undefined,
      email: undefined,
      phone: undefined,
      signUpTime: undefined,
      activeTime: undefined,
      builtIn: undefined,
      disabled: undefined,
      resName: undefined,
      resNo: undefined,
    },
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put, all }) {
      const {
        user: { response },
        raabs: { response: raabsResponse },
      } = yield all({
        user: call(findUserById, payload.id),
        raabs: call(getUserRaabs, payload.id),
      });
      yield put({
        type: 'updateState',
        payload: {
          formData: response || {},
          raabs: Array.isArray(raabsResponse) ? raabsResponse : [],
        },
      });
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
