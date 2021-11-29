import { findbuAcc } from '@/services/org/bu/bu';
import {
  findBuProdClass,
  queryClassTree,
  createBuProdClass,
} from '@/services/org/bu/component/buBusinessScope';
import { createNotify } from '@/components/core/Notify';
import router from 'umi/router';

export default {
  namespace: 'buBusinessScope',

  state: {
    buId: 0,
    dataList: [],
    classTree: [],
    delList: [],
    total: null,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findBuProdClass, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(response.datum) ? response.datum : [],
          buId: payload,
        },
      });
    },

    *queryProdClassTree({ payload }, { call, put }) {
      const { response } = yield call(queryClassTree);
      yield put({
        type: 'updateState',
        payload: {
          classTree: Array.isArray(response) ? response : [],
        },
      });
    },

    *updateBasic({ payload }, { call, put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ buResInfo }) => buResInfo);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
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
