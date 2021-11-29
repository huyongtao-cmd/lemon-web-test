import createMessage from '@/components/core/AlertMessage';

import {
  createWithdrawPay,
  modifyWithdrawPay,
  queryWithdrawIds,
} from '@/services/user/equivalent/equivalent';

import { findResById } from '@/services/plat/res/resprofile';

import { closeThenGoto } from '@/layouts/routerControl';
import { clone } from 'ramda';

export default {
  namespace: 'withdrawPay',
  state: {
    formData: {},
    dataSource: [],
    total: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryWithdrawIds, payload);
      if (status === 200) {
        const dataSource = clone(Array.isArray(response.rows) ? response.rows : []);
        const totalAmt = dataSource.reduce((sum, data) => sum + data.amt, 0);
        yield put({
          type: 'updateState',
          payload: {
            formData: { amt: totalAmt },
            dataSource,
            total: response.total,
          },
        });
      }
    },

    *submit({ payload }, { call, put }) {
      let response;
      if (payload.entity.id) {
        response = yield call(modifyWithdrawPay, payload);
      } else {
        // 新增
        response = yield call(createWithdrawPay, payload);
      }
      if (response.response && response.response.ok) {
        // 保存成功
        closeThenGoto(`/hr/salary/withdrawPayList`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
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
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
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
