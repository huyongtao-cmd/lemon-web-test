import createMessage from '@/components/core/AlertMessage';

import {
  businessPageCreate,
  businessPageModify,
  businessPageDetail,
  addPageScene,
} from '@/services/sys/system/pageConfig';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'businessSceneManageModal',
  state: {
    formData: {},
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
      const { response } = yield call(addPageScene, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
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
