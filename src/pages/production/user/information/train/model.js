import { trainImport } from '@/services/production/user';

const defaultState = {
  formData: {},
  formMode: 'EDIT',
};
export default {
  namespace: 'userTrain',
  state: defaultState,
  effects: {
    *upload({ payload }, { call, put, select }) {
      const { status, response } = yield call(trainImport, payload);
      if (status === 200) {
        return response;
      }
      return {};
    },
  },
  reducers: {},
};
