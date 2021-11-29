import { addBannerRq, getBannerDetailsRq } from '@/services/sys/market/banner';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'sysMarketBannerEdit',
  state: {
    formData: {},
  },

  effects: {
    *save({ payload }, { call, put }) {
      const { status, response } = yield call(addBannerRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/plat/market/banner`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *getDetails({ payload }, { call, put }) {
      const { status, response } = yield call(getBannerDetailsRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          const detail = response.datum ? response.datum : {};
          yield put({
            type: 'updateForm',
            payload: {
              ...detail,
            },
          });
        } else {
          const message = response.reason || '获取详细信息失败';
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
