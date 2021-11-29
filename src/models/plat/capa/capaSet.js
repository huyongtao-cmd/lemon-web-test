import { querySets, findSetById, saveSet } from '@/services/plat/capa/set';
import { changeCapeSetStatus } from '@/services/plat/capa/capa';
import { queryCascaderUdc } from '@/services/gen/app';

export default {
  namespace: 'platCapaSet',

  state: {
    // 查询系列
    searchForm: {
      capasetStatus: 'ACTIVE',
    },
    dataSource: [],
    total: 0,
    jobType2Data: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { jobType, ...params } = payload;
      const newParams = {
        ...params,
        jobType1: Array.isArray(jobType) ? jobType[0] : '',
        jobType2: Array.isArray(jobType) ? jobType[1] : '',
      };
      const {
        response: { rows, total },
      } = yield call(querySets, newParams);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },
    *queryLevelList({ payload }, { call, put }) {
      const { response } = yield call(changeCapeSetStatus, payload);
      return response;
    },

    *jobTypeChange({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:JOB_TYPE2',
        parentDefId: 'COM:JOB_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { jobType2Data: Array.isArray(response) ? response : [] },
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
      history.listen(location => {});
    },
  },
};
