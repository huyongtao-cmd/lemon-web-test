import {
  getCourseDetailPush,
  getPushCourseCapa,
  getPushCourseCapaSet,
  getDetailCourseList,
} from '@/services/plat/capa/train';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

const defaultTreeData = [
  {
    title: '全部',
    text: '全部',
    key: 'all',
    id: -999,
    sort: 1,
    child: [],
  },
];
export default {
  namespace: 'platTrainDetail',
  state: {
    treeData: defaultTreeData,
    pageConfig: {},
    dataSource: [],
    total: 0,
    searchForm: {
      progStatus: 'IN_USE',
    },
    resourceDataSource: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getCourseDetailPush, payload);
      const { ok, datum = {} } = response;
      const { trainingProgListView = {}, trainingResScopeViewList = [] } = datum;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            courseDetail: trainingProgListView,
            resourceDataSource: trainingResScopeViewList,
          },
        });
      }
    },

    *queryCapaList({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(getPushCourseCapa, payload);

      yield put({
        type: 'updateState',
        payload: {
          capaDataSource: Array.isArray(rows) ? rows : [],
          capaTotal: total,
        },
      });
    },

    *queryCourseList({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(getDetailCourseList, payload);

      yield put({
        type: 'updateState',
        payload: {
          courseDataSource: Array.isArray(rows) ? rows : [],
          courseTotal: total,
        },
      });
    },

    *queryCapaSetList({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(getPushCourseCapaSet, payload);

      yield put({
        type: 'updateState',
        payload: {
          capaSetDataSource: Array.isArray(rows) ? rows : [],
          capaSetTotal: total,
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
