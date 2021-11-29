import createMessage from '@/components/core/AlertMessage';
import { isNil } from 'ramda';

import { tenantCreate, tenantModify, tenantDetail } from '@/services/sys/system/tenant';

import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'tenantEdit',
  state: {
    formData: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(tenantDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...response },
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (!isNil(payload.id)) {
        response = yield call(tenantModify, payload);
      } else {
        // 新增
        response = yield call(tenantCreate, payload);
      }
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 保存成功
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
          },
        });
        closeThenGoto(`/back/tenant/tenantList`);
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
