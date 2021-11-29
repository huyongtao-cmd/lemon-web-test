import { isNil } from 'ramda';
import { queryUserPrincipal } from '@/services/gen/user';
import { authCheckingChain, getAvatar } from '@/services/gen/app';
import { toQs } from '@/utils/stringUtils';

/**
 * 系统用户信息状态
 */
export default {
  namespace: 'user',

  state: {
    // 用户
    user: {
      info: {},
      extInfo: {},
    },
    // 用户快捷方式
    newSortNo: void 0,
    formData: {},
    myShortCut: [],
    sysShortCut: [],
  },

  effects: {
    /**
     * 获取系统当前登录用户上下文
     * @param _
     * @param select
     * @return {IterableIterator<*>}
     */ *getPrincipal(_, { select }) {
      return yield select(({ user: { user } }) => ({ user }));
    },

    *fetchPrincipal(_, { call, put }) {
      const { response } = yield call(queryUserPrincipal);
      // 缓存前端用户信息
      yield put({
        type: 'updateState',
        payload: {
          user: response,
        },
      });
      return { user: response };
    },
    *authChecking({ payload }, { call, put }) {
      const user = yield call(authCheckingChain);
      if (isNil(user)) {
        return false;
      }
      const {
        extInfo: { resId },
      } = user;
      yield put({
        type: 'updateState',
        payload: {
          user,
        },
      });
      return user === true ? true : user;
    },
    *getAvatarFn({ payload }, { call, put, select }) {
      const userMsg = yield select(({ user: { user } }) => ({ user }));
      if (isNil(userMsg.user)) {
        return false;
      }
      const {
        user: {
          extInfo: { resId },
        },
      } = userMsg;
      const res = yield call(getAvatar, resId);
      if (res !== false) {
        userMsg.user.avatar = res;
        yield put({
          type: 'updateState',
          payload: {
            user: userMsg.user,
          },
        });
        return userMsg.user;
      }
      return false;
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
