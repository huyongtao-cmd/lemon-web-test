import {
  getCourseDetailPush,
  queryCapaSetList,
  pushCourseHandle,
  queryRes,
  queryResType,
} from '@/services/plat/capa/train';
import { queryCascaderUdc, queryBuList } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'platTrainPush',

  state: {},

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getCourseDetailPush, payload);
      const { ok, datum = {} } = response;
      const { trainingProgListView = {} } = datum;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            courseDetail: trainingProgListView,
          },
        });
      }
    },
    *getCapaSetList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaSetList);
      const { datum = [] } = response;
      if (status === 200) {
        const capaSetList = datum.map(item => {
          const newItem = Object.assign({}, item);
          newItem.key = item.id;
          newItem.title = item.name;
          return newItem;
        });
        yield put({
          type: 'updateState',
          payload: {
            capaSetList,
          },
        });
      }
    },
    *getResList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryRes);
      const { datum = [] } = response;
      if (status === 200) {
        const resList = datum.map(item => {
          const newItem = Object.assign({}, item);
          newItem.key = item.id;
          newItem.title = item.code + '-' + item.name;
          return newItem;
        });
        yield put({
          type: 'updateState',
          payload: {
            resList,
          },
        });
      }
    },

    *getResTypeList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryResType);
      const { datum = [] } = response;
      if (status === 200) {
        const resTypeList = datum.map(item => {
          const newItem = Object.assign({}, item);
          newItem.key = item.resType1 + '&' + item.resType2;
          newItem.title = item.udcText;
          return newItem;
        });
        yield put({
          type: 'updateState',
          payload: {
            resTypeList,
          },
        });
      }
    },

    *push({ payload }, { call, put, select }) {
      const { status, response } = yield call(pushCourseHandle, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '推送成功' });
        closeThenGoto('/hr/capacity/train');
      } else {
        createMessage({ type: 'error', description: response.datum });
      }
    },

    *queryCommonData(_, { call, put, select }) {
      const { response = [], status } = yield call(queryBuList);
      if (status === 200) {
        let buList = response.filter(item => item.buStatus === 'ACTIVE');
        buList = buList.map(item => {
          const newItem = Object.assign({}, item);
          newItem.key = item.id;
          newItem.title = item.name;
          return newItem;
        });
        yield put({
          type: 'updateState',
          payload: {
            buList: buList || [],
          },
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
