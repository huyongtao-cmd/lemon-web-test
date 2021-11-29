import { findCapaById, findCourseDetailById } from '@/services/plat/capa/capa';

export default {
  namespace: 'platCapaDetail',

  state: {
    detailForm: {},
    tablePropsList: [],
    tableDetailPropsList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findCapaById, payload);
      const { datum = {} } = response;
      const { capaAbilityEntityList = [], capaLevelNewViewList = [], hasLevelFlag } = datum;
      const hasLevelFlagTablePropsList = capaLevelNewViewList.map(item => {
        const newItem = item;
        const { leveldId } = newItem;
        newItem.checkpoint = [];
        capaAbilityEntityList.forEach(itemPoint => {
          const { leveldIdList } = itemPoint;
          if (leveldIdList && leveldIdList.length > 0) {
            const inLevel = leveldIdList.find(lItem => lItem.leveldId === leveldId);
            if (inLevel) {
              newItem.checkpoint.push(itemPoint);
            }
          }
        });
        return newItem;
      });
      console.error('hasLevelFlagTablePropsList', hasLevelFlagTablePropsList);
      yield put({
        type: 'updateState',
        payload: {
          detailForm: response.datum || {},
          tablePropsList: hasLevelFlag ? response.datum.capaLevelNewViewList || [] : [],
          tableDetailPropsList: capaAbilityEntityList || [],
          hasLevelFlagTablePropsList: hasLevelFlag ? hasLevelFlagTablePropsList || [] : [],
        },
      });

      return response;
    },

    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          detailForm: {},
          tablePropsLis: [],
          tableDetailPropsList: [],
        },
      });
    },

    *queryCourseDetail({ payload }, { call, put, select }) {
      const { response } = yield call(findCourseDetailById, payload);
      const { datum = {} } = response;
      yield put({
        type: 'updateState',
        payload: {
          courseDetail: datum || {},
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
