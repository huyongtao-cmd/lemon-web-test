import { transferMoneyDetailRq } from '@/services/plat/transferMoney';

export default {
  namespace: 'transferMoneyDetail',
  state: {
    formData: {},
  },
  effects: {
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(transferMoneyDetailRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateForm',
            payload: {
              ...response,
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
