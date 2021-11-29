import createMessage from '@/components/core/AlertMessage';

import {
  businessCheckCreate,
  businessCheckModify,
  businessCheckDetail,
} from '@/services/sys/system/function';

import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'businessCheckEdit',
  state: {
    formData: {},
    dataSource: [],
    deleteKeys: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(businessCheckDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...response },
            dataSource: response.messages || [],
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        response = yield call(businessCheckModify, payload);
      } else {
        // 新增
        response = yield call(businessCheckCreate, payload);
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
        closeThenGoto(`/sys/system/businessCheckList?functionId=${payload.functionId}`);
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
