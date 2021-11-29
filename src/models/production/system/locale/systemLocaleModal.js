import { systemSelectionListByKey, systemLocaleLogicalUpload } from '@/services/production/system';

export default {
  namespace: 'systemLocaleModal',
  state: {
    languageData: [],
  },

  // subscriptions: {
  //   setup({ dispatch, history }) {
  //     return dispatch({
  //       type: 'getLanguage',
  //       payload: {},
  //     });
  //   },
  // },

  effects: {
    *getLanguage({ payload }, { call, put }) {
      const { response, status } = yield call(systemSelectionListByKey, { key: 'SYSTEM_LANGUAGE' });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            languageData: response.data,
          },
        });
      }
    },

    *upload({ payload }, { call, put }) {
      const { response, status } = yield call(systemLocaleLogicalUpload, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
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
  },
};
