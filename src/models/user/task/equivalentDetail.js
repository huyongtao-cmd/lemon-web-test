import { equivalentDetailRq } from '@/services/user/task/equivalent';

export default {
  namespace: 'equivalentDetail',
  state: {
    formData: {},
  },
  effects: {
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(equivalentDetailRq, payload); // todo
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              ...response.datum,
            },
          });
        }
        return response;
      }
      return {};
    },
  },
  reducers: {
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
