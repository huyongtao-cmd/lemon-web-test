import { getResHrLabel, saveResHrLabel } from '@/services/plat/res/resprofile';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'platResProfilePersonel',

  state: {
    personelFormData: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getResHrLabel, payload.resId);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            personelFormData: response.datum || {},
          },
        });
      }
    },

    // 提交按钮事件
    *submit({ payload }, { call, select }) {
      const { status, response } = yield call(saveResHrLabel, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/hr/res/profile/list');
      } else {
        createMessage({ type: 'error', description: '保存失败' });
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
