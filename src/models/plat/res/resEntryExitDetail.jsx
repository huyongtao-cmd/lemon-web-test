import { findEntryExitList } from '@/services/plat/res/resprofile';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'platResEntryExitDetail',

  state: {
    entryExitList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findEntryExitList, payload);
      yield put({
        type: 'updateState',
        payload: {
          entryExitList: Array.isArray(response.datum) ? response.datum : [],
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
  },
};
