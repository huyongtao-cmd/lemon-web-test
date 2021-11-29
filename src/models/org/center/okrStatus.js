import createMessage from '@/components/core/AlertMessage';
import { getOkrListByStatusFn, stateStatisRq } from '@/services/okr/okrMgmt';

export default {
  namespace: 'orgCenterOkrStatus',
  state: {
    buList: [],
    buInfo: {},
  },

  effects: {
    *queryOkrList({ payload }, { call, put, select }) {
      const { id, krStatusValue, offset } = payload;
      const params = {
        id,
        offset,
        limit: 10,
        krStatus: krStatusValue,
      };
      const { status, response } = yield call(getOkrListByStatusFn, params);
      if (response) {
        const { rows, total } = response;
        const okrList = Array.isArray(rows) ? rows : [];
        const okrListTotal = total;
        yield put({
          type: 'updateState',
          payload: {
            okrList,
            okrListTotal,
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
};
