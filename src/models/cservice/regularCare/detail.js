/* eslint-disable no-nested-ternary */
import moment from 'moment';
import {
  createRegularCareDetail,
  getCareDetailById,
  updateMeetingRoom,
} from '@/services/cservice/regularCare';
import { findResById } from '@/services/plat/computer';

export default {
  namespace: 'regularCareListDetail',
  state: {
    formData: {},
  },

  effects: {
    // 选择申请人带出：BASE地baseCityName、申请人所属BUbaseBuName、补贴额度compfeeQuota
    *changeApplyResId({ payload }, { call, put }) {
      const {
        status,
        response: { ok, datum },
      } = yield call(findResById, payload);
      if (status === 100) {
        // 自动取消请求
        return;
      }
      if (ok) {
        const { id, baseCityName, baseBuName, baseBuId, compfeeQuota } = datum || {};
        yield put({
          type: 'updateForm',
          payload: {
            applyResId: id,
            baseCityName,
            resBuName: baseBuName,
            buId: baseBuId,
            monthlyAmt: compfeeQuota,
          },
        });
      }
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { mode } = payload;
      if (mode === 'create') {
        yield put({
          type: 'updateState',
          payload: {
            formData: { createTime: moment() },
          },
        });
      } else {
        const { id } = payload;
        const { status, response } = yield call(getCareDetailById, id);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          const data = response.datum;
          const createTime = { createTime: moment() };
          yield put({
            type: 'updateState',
            payload: {
              formData: { ...data, ...createTime },
            },
          });
        }
      }
      return {};
    },
    // 保存
    *save({ payload }, { call, put, select }) {
      const { mode, values } = payload;
      if (mode === 'create') {
        const { status, response } = yield call(createRegularCareDetail, values);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          return response;
        }
        return {};
      }
      if (mode === 'copy') {
        const { id } = values;
        const ids = { id: '' };
        const valuesNew = { ...values, ...ids };
        const { status, response } = yield call(createRegularCareDetail, valuesNew);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          return response;
        }
        return {};
      }
      if (mode === 'edit') {
        const { id } = payload;
        const { status, response } = yield call(createRegularCareDetail, { id, ...values });
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          return response;
        }
        return {};
      }
      return {};
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
