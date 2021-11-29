import { clearCacheHandle } from '@/services/sys/system/setting';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'syssetting',
  state: {},

  effects: {
    *clearCacheHandleFn({ payload }, { call, put }) {
      const response = yield call(clearCacheHandle);
      if (response.status === 200) {
        createMessage({ type: 'success', description: '清除成功' });
      }
    },
  },

  reducers: {},

  subscriptions: {},
};
