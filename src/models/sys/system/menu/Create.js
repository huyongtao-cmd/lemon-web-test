import { menuCreate } from '@/services/sys/system/menuConfig';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'MenuConfigCreate',
  state: {
    formData: {},
  },

  effects: {
    *save({ payload }, { call, put }) {
      const params = payload;
      delete params.selecteFunUrl;
      const { status, response } = yield call(menuCreate, params);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/sys/system/MenuConfig`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
  },

  reducers: {
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
