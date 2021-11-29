import router from 'umi/router';
import {
  findBuResByResId,
  findBuResRole,
  findBuResExamList,
  findResProjlogsList,
  findResEvalAvg,
} from '@/services/plat/res/resprofile';

export default {
  namespace: 'platResProfileOrg',

  state: {
    buResFormData: {},
    buResRoleDataSource: [],
    buResExamDataSource: [],
    resProjlogDataSource: [],
    resEvalAvgDataSource: {},
  },

  effects: {
    // 查询单条BU资源数据内容
    *query({ payload }, { call, put }) {
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
    // 查询评价信息
    *queryEval({ payload }, { call, put }) {
      const { response } = yield call(findResEvalAvg, payload);
      const { datum = {} } = response;
      yield put({
        type: 'updateState',
        payload: {
          resEvalAvgDataSource: datum,
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
