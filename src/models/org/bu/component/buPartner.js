import { findByBuId } from '@/services/org/bu/component/buPartner';
import router from 'umi/router';
import { createNotify } from '@/components/core/Notify';
import { message } from 'antd';

export default {
  namespace: 'orgbuPartner',

  state: {
    buId: 0,
    dataList: [],
    delList: [],
    mode: 'create',
    total: 0,
    expirys: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findByBuId, { buId: payload });
      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(response.datum) ? response.datum : [],
          buId: payload,
        },
      });
    },

    *save({ payload }, { call, put, select }) {
      const { buId, dataList } = yield select(({ orgbuPartner }) => orgbuPartner);
      // eslint-disable-next-line
      // if (buId) {
      //   const { response } = yield call(findByBuId, buId, dataList);
      //   if (response.ok) {
      //     createNotify({ title: 'misc.success', code: 'misc_success', type: 'success' });
      //   } else {
      //     createNotify({ title: 'misc.hint', code: 'misc_fail', type: 'error' });
      //   }
      // }
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
