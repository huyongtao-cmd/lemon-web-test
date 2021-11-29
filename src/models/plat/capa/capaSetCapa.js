import {
  findSetById,
  querySetLevelsById,
  querySetAbilityByLevelId,
  addCapaSetCapas,
  deleteCapaSetCapas,
  changeCapaSetCapa,
} from '@/services/plat/capa/set';

export default {
  namespace: 'platCapaSetCapa',

  state: {
    // 查询系列
    detailForm: {},
    detailList: [],
    selCapaId: -1, // 关联查询用ID
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findSetById, payload);

      yield put({
        type: 'updateState',
        payload: {
          detailForm: response.datum || {},
        },
      });

      return response;
    },

    *queryAlias({ payload }, { call, put }) {
      const { response } = yield call(querySetLevelsById, payload);
      yield put({
        type: 'updateState',
        payload: {
          detailList: Array.isArray(response.datum) ? response.datum : [],
        },
      });

      return response;
    },

    *clearAbilities(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          selCapaId: -1,
        },
      });
    },

    *changeCapaList({ payload }, { call }) {
      // console.log('payload ->', payload);
      const { response } = yield call(addCapaSetCapas, payload.entities);
      return response;
    },

    *deleteCapaList({ payload }, { call }) {
      const { status, response } = yield call(deleteCapaSetCapas, payload);
      return { status, response };
    },

    *changeCapaSetCapa({ payload }, { call }) {
      // console.log('payload ->', payload);
      const { response } = yield call(changeCapaSetCapa, payload.entities);
      return response;
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
