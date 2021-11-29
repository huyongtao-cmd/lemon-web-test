import { fakeRegister } from '@/services/gen/app';
import { setAuthority } from '@/utils/authUtils';
import { reloadAuthorized } from '@/layouts/Authorized';

/**
 * @deprecated
 * 用户注册模块
 */
export default {
  namespace: 'register',

  state: {
    status: undefined,
  },

  effects: {
    *submit({ payload }, { call, put }) {
      const { response } = yield call(fakeRegister, payload);
      yield put({
        type: 'registerHandle',
        payload: response,
      });
    },
  },

  reducers: {
    registerHandle(state, { payload }) {
      setAuthority('user');
      reloadAuthorized();
      return {
        ...state,
        status: payload.status,
      };
    },
  },
};
