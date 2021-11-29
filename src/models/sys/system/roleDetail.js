import { findRoleById } from '@/services/sys/iam/roles';

export default {
  namespace: 'sysroleDetail',

  state: {
    formData: {
      builtIn: undefined,
      code: undefined,
      disabled: undefined,
      name: undefined,
      navs: undefined,
      pcode: undefined,
      raabs: undefined,
      remark: undefined,
    },
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const { response } = yield call(findRoleById, payload.id);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response || {},
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
