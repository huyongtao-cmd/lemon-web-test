import {
  findSetById,
  querySetAbilityByLevelId,
  querySetLevelsById,
} from '@/services/plat/capa/set';

export default {
  namespace: 'platCapaSetDetail',

  state: {
    // 查询系列
    detailForm: {},
    dataList: [],
    dataList2: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findSetById, payload);
      const { datum = {} } = response;
      const { capasetCapaEntityList = [], capasetLevelEntities = [], hasLevelFlag } = datum;
      const hasLevelFlagTablePropsList = capasetLevelEntities.map(item => {
        const newItem = item;
        const { leveldId } = newItem;
        newItem.ability = [];
        capasetCapaEntityList.forEach(itemPoint => {
          const { capaSetLevelReViews } = itemPoint;
          const inLevel = capaSetLevelReViews.find(lItem => lItem.leveldId === leveldId);
          if (inLevel) {
            newItem.ability.push(itemPoint);
          }
        });
        return newItem;
      });

      yield put({
        type: 'updateState',
        payload: {
          detailForm: response.datum || {},
          dataList: hasLevelFlag ? capasetLevelEntities || [] : [],
          dataList2: capasetCapaEntityList,
          hasLevelFlagTablePropsList: hasLevelFlag ? hasLevelFlagTablePropsList || [] : [],
        },
      });

      return response;
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          detailForm: {},
          dataList: [],
          dataList2: [],
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
