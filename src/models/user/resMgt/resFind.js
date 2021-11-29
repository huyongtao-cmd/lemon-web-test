import { queryResFindList } from '@/services/user/resMgt/resFind';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectCapasetLevel, selectCapaLevel } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty } from 'ramda';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'resFind',

  state: {
    dataSource: [],
    searchForm: {
      capaset: ['0', null],
      capa: ['0', null],
    },
    total: null,
    capasetData: [],
    capaData: [],
    baseBuData: [],
    baseBuDataSource: [],
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const parm = { ...payload };
      // 当量系数
      if (payload.eqvaRatio) {
        const [min, , max] = payload.eqvaRatio;
        parm.minEqvaRatio = min;
        parm.maxEqvaRatio = max;
      }
      // baseBU
      if (payload.baseBu) {
        parm.baseBuId = payload.baseBu.id;
      }
      // 复合能力
      if (payload.capaset && payload.capaset[1]) {
        if (!payload.capaset[0]) {
          createMessage({ type: 'warn', description: '请选择复合能力范围' });
          return;
        }
        const { capasetData } = yield select(({ resFind }) => resFind);
        const [capaSetCompare, capaSetId] = payload.capaset;
        parm.capaSetNameCompare = capaSetCompare;
        parm.capaSetName = capasetData[capaSetId - 1].capasetId;
        parm.capaSetNameLevel = capasetData[capaSetId - 1].leveldSortNo;
      }
      // 单项能力
      if (payload.capa && payload.capa[1]) {
        if (!payload.capa[0]) {
          createMessage({ type: 'warn', description: '请选择单项能力范围' });
          return;
        }
        const { capaData } = yield select(({ resFind }) => resFind);
        const [capaCompare, capaId] = payload.capa;
        parm.capaNameCompare = capaCompare;
        parm.capaName = capaData[capaId - 1].capaId;
        parm.capaNameLevel = capaData[capaId - 1].leveldSortNo;
      }

      // 去除接口多余字段
      delete parm.capaset;
      delete parm.capa;
      delete parm.eqvaRatio;
      delete parm.baseBu;

      // console.warn('parm', parm);

      const { response } = yield call(queryResFindList, parm);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },

    *capaset({ payload }, { call, put }) {
      const { response } = yield call(selectCapasetLevel);
      yield put({
        type: 'updateState',
        payload: {
          capasetData: Array.isArray(response) ? response : [],
        },
      });
    },
    *capa({ payload }, { call, put }) {
      const { response } = yield call(selectCapaLevel);
      yield put({
        type: 'updateState',
        payload: {
          capaData: Array.isArray(response) ? response : [],
        },
      });
    },
    *baseBU({ payload }, { call, put, select }) {
      const { status, response } = yield call(selectBuMultiCol);
      yield put({
        type: 'updateState',
        payload: {
          baseBuData: Array.isArray(response) ? response : [],
          baseBuDataSource: Array.isArray(response) ? response : [],
        },
      });
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
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
