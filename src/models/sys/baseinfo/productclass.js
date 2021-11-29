import {
  queryProdClassesList,
  deleteProdClasses,
  addProdClasses,
  updateProdClasses,
  queryProdClassesTree,
} from '@/services/sys/baseinfo/productClass';
import { createAlert } from '@/components/core/Confirm';

export default {
  namespace: 'sysProductClass',

  state: {
    list: [],
    total: 0,
    tree: [],
    searchValue: '',
    pid: -1,
    formData: {
      id: null,
      classCode: null,
      className: null,
      pclassName: null,
      pid: -1,
      sortNo: null,
      remark: null,
    },
    filterData: {},
  },

  effects: {
    *fetch({ payload }, { call, put, select }) {
      const filterData = yield select(({ sysProductClass }) => sysProductClass.filterData);
      // console.log('====', filterData, payload);
      const newFilterData = Object.assign({}, filterData, payload);
      if (newFilterData) {
        yield put({
          type: 'updateState',
          payload: { filterData: newFilterData },
        });
      }
      // console.log('====', newFilterData);
      const {
        response: { rows, total },
      } = yield call(queryProdClassesList, newFilterData);

      yield put({
        type: 'updateState',
        payload: {
          list: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },
    *tree({ payload }, { call, put }) {
      const { response } = yield call(queryProdClassesTree, payload);
      yield put({
        type: 'updateState',
        payload: {
          tree: Array.isArray(response) ? response : [],
        },
      });
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(deleteProdClasses, payload.ids);
      if (response.ok) {
        const filterData = yield select(({ sysProductClass }) => sysProductClass.filterData);
        yield put({
          type: 'fetch',
          payload: filterData,
        });
      }
      return { status, response };
    },
    *add({ payload }, { call, put }) {
      // console.log('xinzheng');
      const {
        status,
        response: { reason },
      } = yield call(addProdClasses, payload);
      return { status, reason };
    },
    *update({ payload }, { call, put }) {
      // console.log('gengxin');
      const {
        status,
        response: { reason },
      } = yield call(updateProdClasses, payload);
      return { status, reason };
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
      history.listen(location => {});
    },
  },
};
