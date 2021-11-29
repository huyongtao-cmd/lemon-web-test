import { queryBasicProfile, queryAdvancedProfile, queryUdc } from '@/services/gen/app';

export default {
  namespace: 'fiddle', // 测试用

  state: {
    // ---- 基础页面 ----
    tabModified: [0, 0, 0], // 记录哪个tab修改过 - 这个需要放在redux中
    formData: {}, // 表单对象

    // ---- 高级页面 ----
    basicGoods: [],
    advancedOperation1: [],
    advancedOperation2: [],
    advancedOperation3: [],
  },

  effects: {
    *fetchBasic(_, { call, put }) {
      const { response } = yield call(queryBasicProfile);
      yield put({
        type: 'show',
        payload: response,
      });
    },
    *fetchAdvanced(_, { call, put }) {
      const { response } = yield call(queryAdvancedProfile);
      yield put({
        type: 'show',
        payload: response,
      });
    },
    *fetchUdc({ payload }, { call }) {
      const { response } = yield call(queryUdc, payload);
      return response;
    },
    *updateTab({ payload }, { put }) {
      // console.log('----->>', action.payload);
      yield put({
        type: 'show',
        payload: {
          operationkey: payload.operationkey,
        },
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateForm(state, { payload }) {
      return {
        ...state,
        formData: { ...state.formData, ...payload },
      };
    },
  },

  subscriptions: {},
};
