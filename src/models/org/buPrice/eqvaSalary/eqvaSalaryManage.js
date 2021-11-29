import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';

import { selectFinperiod } from '@/services/user/Contract/sales';

export default {
  namespace: 'eqvaSalaryManage',
  state: {
    formData: {
      reprotCompPercent: 0,
      confirmCompPercent: 0,
      confirmAmt: 0,
    },
  },
  effects: {
    // *query({ payload }, { call, put }) {
    //
    // },

    *queryFinPeriod({ payload }, { call, put }) {
      const { status, response } = yield call(selectFinperiod);
      if (status === 200) {
        const nowString = formatDT(moment()).substring(0, 7);
        let currentFinPeriodId;
        const perildListNow = response.filter(period => period.name === nowString);
        if (!isEmpty(perildListNow)) {
          currentFinPeriodId = perildListNow[0].id;
        }
        yield put({
          type: 'updateState',
          payload: {
            finperiodList: response,
            currentFinPeriodId,
          },
        });
      }
    },

    // *save({ payload }, { call, put }) {
    //
    // },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
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
