import { getTodo, getDone, getProcs, getNotify, readNotify } from '@/services/user/flow/flow';

export default {
  namespace: 'processPanel2',

  state: {
    todoList: [],
    doneList: [],
    notifyList: [],
    procsList: [],
  },

  effects: {
    *todo({ payload }, { call, put }) {
      const { response } = yield call(getTodo, payload);
      // console.warn(response.rows);
      yield put({
        type: 'updateState',
        payload: {
          todoList: Array.isArray(response.rows) ? response.rows : [],
          todoTotalCount: response.total,
        },
      });
    },

    *done({ payload }, { call, put }) {
      const { response } = yield call(getDone, payload);
      // console.warn(response);
      yield put({
        type: 'updateState',
        payload: {
          doneList: Array.isArray(response.rows) ? response.rows : [],
          doneTotalCount: response.total,
        },
      });
    },

    *notify({ payload }, { call, put }) {
      const { response } = yield call(getNotify, payload);
      // console.warn(response);
      yield put({
        type: 'updateState',
        payload: {
          notifyList: Array.isArray(response.rows) ? response.rows : [],
          notifyTotalCount: response.total,
        },
      });
    },

    *procs({ payload }, { call, put }) {
      const { response } = yield call(getProcs, payload);
      // console.warn(response);
      yield put({
        type: 'updateState',
        payload: {
          procsList: Array.isArray(response.rows) ? response.rows : [],
          procsTotalCount: response.total,
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
