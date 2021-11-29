import createMessage from '@/components/core/AlertMessage';

import {
  findSettleList,
  buWithdrawCreate,
  modifyWithdraw,
  getBuWithdrawSum,
} from '@/services/user/equivalent/equivalent';

import { findResById } from '@/services/plat/res/resprofile';

import { closeThenGoto } from '@/layouts/routerControl';
import { clone } from 'ramda';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';

const defaultFormData = { withdrawType: 'BU' };

export default {
  namespace: 'buWithdraw',
  state: {
    formData: defaultFormData,
    dataSource: [],
    total: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(findSettleList, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: clone(Array.isArray(response.rows) ? response.rows : []),
            total: response.total,
          },
        });
      }
    },

    *getBuWithdrawSum({ payload }, { call, put }) {
      const { status, response } = yield call(getBuWithdrawSum, payload);
      if (status === 200) {
        yield put({
          type: 'updateForm',
          payload: {
            applyAmt: response.approveSettleAmt,
            eqva: response.approveSettleEqva,
          },
        });
      }
    },

    *submit({ payload }, { call, put }) {
      let response;
      if (payload.entity.id) {
        response = yield call(modifyWithdraw, payload);
      } else {
        // 新增
        response = yield call(buWithdrawCreate, payload);
      }
      if (response.response && response.response.ok) {
        // 保存成功
        closeThenGoto(`/user/flow/process`);
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
