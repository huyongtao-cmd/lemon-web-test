import { queryCapas, findCapaById, changeCapeStatus } from '@/services/plat/capa/capa';
import { queryCascaderUdc } from '@/services/gen/app';

export default {
  namespace: 'platTrainMine',

  state: {
    // 查询系列
    searchForm: {
      capaStatus: 'ACTIVE',
    },
    dataSource: [],
    total: 0,
    type2: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { type, ...params } = payload;
      const newParams = {
        ...params,
        capaType1: Array.isArray(type) ? type[0] : '',
        capaType2: Array.isArray(type) ? type[1] : '',
      };
      const {
        response: { rows, total },
      } = yield call(queryCapas, newParams);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },
    *queryLevelList({ payload }, { call, put }) {
      const { response } = yield call(changeCapeStatus, payload);
      return response;
    },
    // 分类一关联分类二
    *typeChange({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:CAPACITY_TYPE2',
        parentDefId: 'RES:CAPACITY_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2: Array.isArray(response) ? response : [] },
        });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
