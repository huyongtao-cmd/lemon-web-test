import { findBUBasic } from '@/services/org/bu/bu';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'buBasicLinmon',

  state: {
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findBUBasic, payload);
      const { datum = {} } = response;
      yield put({
        type: 'updateState',
        payload: { formData: datum, buId: payload.buId },
      });
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
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
};
