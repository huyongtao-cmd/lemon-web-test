import {
  findResCapaList,
  findResCapasetList,
  queryResEnrollInfo,
} from '@/services/plat/res/resprofile';
import { createNotify } from '@/components/core/Notify';

export default {
  namespace: 'platResProfileCapa',

  state: {
    capaDataSource: [],
    capaTotal: 0,
    capasetDataSource: [],
    capasetTotal: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response: capaResponse } = yield call(findResCapaList, payload);
      const { response: capasetResponse } = yield call(findResCapasetList, payload);

      yield put({
        type: 'updateState',
        payload: {
          capaDataSource: Array.isArray(capaResponse) ? capaResponse : [],
          // capaTotal: capaResponse.total,
          capasetDataSource: Array.isArray(capasetResponse.rows) ? capasetResponse.rows : [],
          capasetTotal: capasetResponse.total,
        },
      });
    },
    *queryApprStatus({ payload }, { call, put }) {
      const { status, response } = yield call(queryResEnrollInfo, payload);
      const data = response.datum || {};
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            apprStatus: data.apprStatus || '',
          },
        });
      }
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
      return history.listen(({ pathname, search }) => {});
    },
  },
};
