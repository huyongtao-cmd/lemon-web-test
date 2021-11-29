import { informationImport } from '@/services/production/user';

const defaultState = {
  formData: {},
  formMode: 'EDIT',
};
export default {
  namespace: 'information',
  state: defaultState,
  effects: {
    *upload({ payload }, { call, put, select }) {
      const { status, response } = yield call(informationImport, payload);
      if (status === 200) {
        return response;
      }
      return {};
    },
  },
  reducers: {},
};
