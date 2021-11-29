import {
  setUpProjectCreateUriRq,
  setUpProjectCreateDetailRq,
} from '@/services/user/project/project';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUserMultiCol } from '@/services/user/Contract/sales';

const defaultFormData = {};

export default {
  namespace: 'setUpProjectCreate',
  state: {
    resDataSource: [],
    baseBuDataSource: [],
    formData: defaultFormData,
  },
  effects: {
    *queryProjList({ payload }, { call, put }) {
      const { status, response } = yield call(setUpProjectCreateDetailRq, payload);
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateForm',
            payload: {
              ...defaultFormData,
              ...response,
            },
          });
        }
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ setUpProjectCreate }) => setUpProjectCreate);
      const { status, response } = yield call(setUpProjectCreateUriRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
        },
      });
    },
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuDataSource: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: { baseBuId: '', baseBuName: '' },
      });
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
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
