import { createCms, detailCms, editCms } from '@/services/sys/market/cms';
import moment from 'moment';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'sysCmsEdit',

  state: {
    formData: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(detailCms, payload);
      const { datum, ok } = response;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: datum || {},
          },
        });
      }
    },

    *edit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysCmsEdit }) => sysCmsEdit);

      if (payload.defId) {
        Object.assign(formData, { id: payload.defId });
      }
      const { status, response } = yield call(editCms, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(`/plat/contentMgmt/cms`);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
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

    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
      };
    },
  },
};
