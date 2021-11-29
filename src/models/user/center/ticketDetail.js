import { queryTicketList, saveTicketList } from '@/services/plat/admin/ticket';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'userTravelTicketDetail',

  state: {
    // 查询系列
    dataList: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        response: { datum, total },
      } = yield call(queryTicketList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(datum) ? datum : [],
          total,
        },
      });
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
