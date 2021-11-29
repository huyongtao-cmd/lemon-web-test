import createMessage from '@/components/core/AlertMessage';

import {
  findSettleList,
  createWithdraw,
  modifyWithdraw,
} from '@/services/user/equivalent/equivalent';

import { findResById } from '@/services/plat/res/resprofile';

import { closeThenGoto } from '@/layouts/routerControl';
import { clone } from 'ramda';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';

export default {
  namespace: 'withdraw',
  state: {
    formData: {},
    posSource: [], // 正数
    negSource: [], // 负数
    total: undefined,
    innerType: '',
    searchForm: {
      settleDate: [formatDT(moment().startOf('month')), formatDT(moment().endOf('month'))],
    },
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      if (payload.settleDate) {
        payload.settleDateStart = payload.settleDate[0]; // eslint-disable-line
        payload.settleDateEnd = payload.settleDate[1]; // eslint-disable-line
        delete payload.settleDate; // eslint-disable-line
      }
      const negSource = [];
      const posSource = [];
      const { status, response } = yield call(findSettleList, payload);
      if (status === 200) {
        response.rows.forEach(row => {
          if (row.transferFlag) {
            // 为负数
            negSource.push(row);
          } else {
            posSource.push(row);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            posSource,
            negSource,
            dataSource: clone(Array.isArray(response.rows) ? response.rows : []),
            total: response.total,
          },
        });
        return negSource;
      }
      return {};
    },

    *queryInnerType({ payload }, { call, put }) {
      const { status, response } = yield call(findResById, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            innerType: response.datum.resType1,
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
        response = yield call(createWithdraw, payload);
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
