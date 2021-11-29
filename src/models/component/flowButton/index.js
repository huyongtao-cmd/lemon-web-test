import { launchFlowFn, pushFlowFn } from '@/services/sys/flowHandle';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'flowButton',

  state: {
    btnCanUse: true,
  },

  effects: {
    *commitFlowHandle({ payload }, { call, put }) {
      const { response } = yield call(launchFlowFn, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
      yield put({
        type: 'updateState',
        payload: {
          btnCanUse: true,
        },
      });
    },
    *pushFlowHandle({ payload }, { call, put }) {
      const { response } = yield call(pushFlowFn, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
      yield put({
        type: 'updateState',
        payload: {
          btnCanUse: true,
        },
      });
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
