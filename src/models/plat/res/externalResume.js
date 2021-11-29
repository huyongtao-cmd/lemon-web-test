import { queryResFindList } from '@/services/user/resMgt/resFind';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryFileToOutList } from '@/services/plat/res/externalResume';
import { selectCapasetLevel, selectCapaLevel } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import { isEmpty } from 'ramda';

export default {
  namespace: 'externalResume',

  state: {
    dataSource: [],
    searchForm: {
      // capaset: ['0', null],
      // capa: ['0', null],
    },
    total: null,
    capasetData: [],
    capaData: [],
    baseBuData: [],
    baseBuDataSource: [],
    type2: [],
    startDate: '',
    endDate: '',
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        if (pathname === '/hr/res/externalResume/List') {
          dispatch({
            type: `updateState`,
            payload: {
              startDate: '',
            },
          });
          dispatch({
            type: `updateState`,
            payload: {
              endDate: '',
            },
          });
        }
      });
    },
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const parm = { ...payload };
      const { startDate, endDate } = yield select(({ externalResume }) => externalResume);
      // 日期区间
      startDate ? (parm.startDate = startDate) : '';
      endDate ? (parm.endDate = endDate) : '';
      // 当量系数
      if (payload.eqvaRatio) {
        const [min, , max] = payload.eqvaRatio;
        parm.minEqvaRatio = min;
        parm.maxEqvaRatio = max;
      }
      // 资源类型
      if (Array.isArray(payload.resTypeArr) && (payload.resTypeArr[0] || payload.resTypeArr[1])) {
        [parm.resType1, parm.resType2] = payload.resTypeArr;
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
        const { capasetData } = yield select(({ externalResume }) => externalResume);
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
      delete parm.fileToOutDate;
      delete parm.capaset;
      delete parm.capa;
      delete parm.eqvaRatio;
      delete parm.baseBu;
      delete parm.resTypeArr;

      // console.warn('parm', parm);

      const { response } = yield call(queryFileToOutList, parm);
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
    // 资源一关联资源二
    *typeChange({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
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
