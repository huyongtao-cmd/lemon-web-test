import createMessage from '@/components/core/AlertMessage';

import {
  dataMartCreate,
  dataMartModify,
  dataMartDetail,
} from '@/services/sys/system/dataWarehouse';

import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'dataMartEdit',
  state: {
    formData: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(dataMartDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...response,
            },
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        response = yield call(dataMartModify, payload);
      } else {
        // 新增
        response = yield call(dataMartCreate, payload);
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
        closeThenGoto(`/sys/system/dataWarehouse`);
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
