import {
  addCapaAbilities,
  changeCapaAbility,
  deleteCapaAbilities,
  findCapaById,
  queryCapaAbilityByLevelId,
  queryCapaLevelsById,
} from '@/services/plat/capa/capa';

export default {
  namespace: 'platCapaAbility',

  state: {
    // 查询系列
    detailForm: {},
    detailList: [],
    selAbilityId: -1, // 关联查询用ID
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findCapaById, payload);

      yield put({
        type: 'updateState',
        payload: {
          detailForm: response.datum || {},
        },
      });

      return response;
    },

    *queryAlias({ payload }, { call, put }) {
      const { response } = yield call(queryCapaLevelsById, payload);
      yield put({
        type: 'updateState',
        payload: {
          detailList: Array.isArray(response.datum) ? response.datum : [],
        },
      });
      return response;
    },

    *queryAbilities({ payload }, { call, put }) {
      const { response } = yield call(queryCapaAbilityByLevelId, payload);
      yield put({
        type: 'updateState',
        payload: {
          abilityList: Array.isArray(response.datum) ? response.datum : [],
        },
      });

      return response;
    },

    *clearAbilities(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          selAbilityId: -1, // 关联查询用ID
        },
      });
    },

    // *changeAbilityList({ payload }, { call }) {
    //   const { response } = yield call(addCapaAbilities, payload);
    //   return response;
    // },

    // *deleteAbilityList({ payload }, { call }) {
    //   const { response } = yield call(deleteCapaAbilities, payload);
    //   return response;
    // },

    // *changeAbility({ payload }, { call }) {
    //   const { response } = yield call(changeCapaAbility, payload);
    //   return response;
    // },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
