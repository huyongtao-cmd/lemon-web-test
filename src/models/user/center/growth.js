import {
  queryGrowthInfo,
  queryCapaInfo,
  capaAttentionCancelFn,
  capaAttentionFn,
  getLeveldInfo,
  leveldDiffFn,
  courseApplyFn,
  saveCertFn,
  checkPointFn,
  saveCapaGrowthFn,
} from '@/services/user/growth';
import { selectCapasetLevel, selectCapaLevel } from '@/services/gen/list';
import { launchFlowFn } from '@/services/sys/flowHandle';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import router from 'umi/router';

export default {
  namespace: 'growthInfo',

  state: {
    capasetData: [],
    growthTreeData: [],
    growthTreeInfo: {},
    infoLoad: false,
    selectTagIds: [],
  },

  effects: {
    *saveCertFnHandle({ payload }, { call, put }) {
      const { response } = yield call(saveCertFn, payload);
      if (response && response.ok) {
        router.push(`/user/center/growth/certificate/edit?id=${response.datum}`);
      }
    },
    *checkPointFnHandle({ payload }, { call, put }) {
      const { response } = yield call(checkPointFn, payload);
      if (response && response.ok) {
        router.push(`/user/center/growth/checkPoint/edit?id=${response.datum}`);
      }
    },
    *saveCapaGrowthFnHandle({ payload }, { call, put }) {
      const { response } = yield call(saveCapaGrowthFn, payload);
      if (response && response.ok) {
        router.push(`/user/center/growth/compoundAbility/edit?id=${response.datum}`);
      }
    },
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryGrowthInfo);
      yield put({
        type: 'updateState',
        payload: {
          growthTreeData: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },

    *queryCapaset({ payload }, { call, put, select }) {
      const { response } = yield call(queryCapaInfo);
      yield put({
        type: 'updateState',
        payload: {
          capasetData: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },
    *attendance({ payload }, { call, put }) {
      const { response } = yield call(capaAttentionFn, payload);
      if (response && response.ok) {
        yield put({
          type: 'query',
        });
        createMessage({ type: 'success', description: '关注成功' });
      } else {
        createMessage({ type: 'warn', description: response.reason });
      }
    },

    *attendanceCancal({ payload }, { call, put }) {
      const { response } = yield call(capaAttentionCancelFn, payload.id);
      if (response && response.ok) {
        yield put({
          type: 'query',
        });
        createMessage({ type: 'success', description: '取消关注成功' });
      } else {
        createMessage({ type: 'warn', description: response.reason });
      }
    },

    *queryLeveldInfo({ payload }, { call, put }) {
      const { response } = yield call(getLeveldInfo, payload);
      yield put({
        type: 'updateState',
        payload: {
          growthTreeInfo: response.datum ? response.datum : {},
          infoLoad: false,
        },
      });
    },

    *queryLeveldDiffFn({ payload }, { call, put }) {
      const { response } = yield call(leveldDiffFn, payload);
      yield put({
        type: 'updateState',
        payload: {
          growthTreeInfo: response.datum ? response.datum : {},
          infoLoad: false,
        },
      });
    },

    *courseApply({ payload }, { call, put }) {
      const { response } = yield call(courseApplyFn, payload);
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'ACC_A53',
          value: {
            id: response.datum,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '申请提交成功' });
          return true;
        }
        return false;
      }
      return false;
    },

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          capasetData: [],
          growthTreeData: [],
          growthTreeInfo: {},
          infoLoad: false,
          selectTagIds: [],
        },
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },
};
