import createMessage from '@/components/core/AlertMessage';

import {
  businessPageCreate,
  businessPageModify,
  businessPageDetail,
} from '@/services/sys/system/pageConfig';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'businessPageMainModal',
  state: {
    formData: {},
    pageFieldEntities: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(businessPageDetail, payload);
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
      if (payload.id) {
        response = yield call(businessPageModify, payload);
      } else {
        // 新增
        response = yield call(businessPageCreate, payload);
      }
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        return response.response.datum;
      }
      createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
      // throw new Error("保存失败");
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('保存失败');
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
