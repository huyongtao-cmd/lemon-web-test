import {
  getDoubleCheckById,
  saveDoubleCheckFn,
  getCapaSetDoubleCheckFn,
  saveCapsSetDoubleCheckFn,
  queryRenewCapa,
  getRenewCapaDetailFn,
  getRenewCapaResFn,
  cancelRenewCapaFn,
} from '@/services/plat/capa/capa';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'platCapaDoubleCheck',

  state: {
    searchForm: {
      renewType: '',
    },
    dataSource: [],
    total: 0,
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(queryRenewCapa, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },
    *queryDoubleCheckDetail({ payload }, { call, put }) {
      const { pageType } = fromQs();
      const api = pageType === 'single' ? getDoubleCheckById : getCapaSetDoubleCheckFn;
      const { response } = yield call(api, payload);
      const { datum = {} } = response;
      yield put({
        type: 'updateState',
        payload: {
          doubleCheckDetail: datum || {},
          capaLevelNameList: datum ? datum.capaLevelNameList : [], // 单项能力
          capaSetleveldName: datum ? datum.capaSetleveldName : [], // 复合能力
        },
      });
    },

    *saveDoubleCheckHandle({ payload }, { call, put }) {
      const { pageType } = fromQs();
      const api = pageType === 'single' ? saveDoubleCheckFn : saveCapsSetDoubleCheckFn;
      const { response } = yield call(api, payload);
      const { ok, reason } = response;
      if (response && ok) {
        createMessage({ type: 'success', description: '发起复核成功' });
        closeThenGoto('/hr/capacity/doubleCheck');
      } else {
        createMessage({ type: 'error', description: reason });
      }
    },
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, { pageNo: payload.pageNo });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
      }
      return {};
    },
    *getPageConfigRes({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, { pageNo: payload.pageNo });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            detailPageConfig: response.configInfo,
          },
        });
      }
      return {};
    },

    *queryDoubleCheckDetailHandle({ payload }, { call, put }) {
      const { response } = yield call(getRenewCapaDetailFn, payload);
      const { datum = {} } = response;
      yield put({
        type: 'updateState',
        payload: {
          doubleCheckDetail2: datum || {},
          capaLevelNameList2: datum ? datum.twAbilityViewList : [],
          twCapaSetlevelTypeName2: datum ? datum.twCapaSetlevelTypeName : [],
        },
      });
    },

    *queryRes({ payload }, { call, put }) {
      const { id } = fromQs();
      const {
        response: { rows, total },
      } = yield call(getRenewCapaResFn, { ...payload, id });

      yield put({
        type: 'updateState',
        payload: {
          resDataSource: Array.isArray(rows) ? rows : [],
          resTotal: total,
        },
      });
    },

    *cancelRes({ payload }, { call, put, select }) {
      const { status, response } = yield call(cancelRenewCapaFn, payload);
      if (status === 200) {
        createMessage({ type: 'success', description: '取消复核成功' });
        yield put({
          type: 'updateState',
          payload: {
            resDataSource: [],
            resTotal: 0,
          },
        });
        yield put({
          type: 'queryRes',
          payload: {},
        });
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
