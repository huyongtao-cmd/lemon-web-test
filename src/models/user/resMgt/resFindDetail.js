import {
  findResById,
  findResProExp,
  findResCapaList,
  findResCapasetList,
  findResGetrpList,
  findResEdubgList,
  findResWorkbgList,
  findResCertList,
  findBuResByResId,
  findBuResRole,
  findBuResExamList,
  findResProjlogsList,
} from '@/services/plat/res/resprofile';

export default {
  namespace: 'resFindDetail',

  state: {
    formData: {},
    edubgDataSource: [],
    workbgDataSource: [],
    certDataSource: [],
    proExpDataSource: [],
    capaDataSource: [],
    capasetDataSource: [],
    dataSource: [],
    buResFormData: {},
    buResRoleDataSource: [],
    buResExamDataSource: [],
    resProjlogDataSource: [],
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findResById, payload.id);
      console.warn(datum);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: { formData: datum || {} },
        });
      }
    },

    *background({ payload }, { call, put }) {
      const { response: edubgResponse } = yield call(findResEdubgList, payload);
      const { response: workbgResponse } = yield call(findResWorkbgList, payload);
      const { response: certResponse } = yield call(findResCertList, payload);

      yield put({
        type: 'updateState',
        payload: {
          edubgDataSource: Array.isArray(edubgResponse.rows) ? edubgResponse.rows : [],
          edubgTotal: edubgResponse.total,
          workbgDataSource: Array.isArray(workbgResponse.rows) ? workbgResponse.rows : [],
          workbgTotal: workbgResponse.total,
          certDataSource: Array.isArray(certResponse.rows) ? certResponse.rows : [],
          certTotal: certResponse.total,
        },
      });
    },

    *projectExperience({ payload }, { call, put }) {
      const { response } = yield call(findResProExp, payload);
      yield put({
        type: 'updateState',
        payload: {
          proExpDataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },

    *capa({ payload }, { call, put }) {
      const { response: capaResponse } = yield call(findResCapaList, payload);
      const { response: capasetResponse } = yield call(findResCapasetList, payload);

      yield put({
        type: 'updateState',
        payload: {
          capaDataSource: Array.isArray(capaResponse.rows) ? capaResponse.rows : [],
          capaTotal: capaResponse.total,
          capasetDataSource: Array.isArray(capasetResponse.rows) ? capasetResponse.rows : [],
          capasetTotal: capasetResponse.total,
        },
      });
    },

    *getrp({ payload }, { call, put }) {
      const { response } = yield call(findResGetrpList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },

    // 查询单条BU资源数据内容
    *queryBU({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findBuResByResId, payload.resId);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: { buResFormData: datum || {} },
        });
      }
    },
    // 查询BU资源角色列表
    *queryBuResRole({ payload }, { call, put }) {
      const { response } = yield call(findBuResRole, payload);
      yield put({
        type: 'updateState',
        payload: {
          buResRoleDataSource: response.datum ? response.datum : '',
        },
      });
    },
    // 查询BU资源考核列表
    *queryBuResExam({ payload }, { call, put }) {
      const { response } = yield call(findBuResExamList, payload);
      yield put({
        type: 'updateState',
        payload: {
          buResExamDataSource: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },
    // 查询资源项目履历列表
    *queryResProjlog({ payload }, { call, put }) {
      const { response } = yield call(findResProjlogsList, payload);
      yield put({
        type: 'updateState',
        payload: {
          resProjlogDataSource: Array.isArray(response.datum) ? response.datum : [],
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
  },
};
