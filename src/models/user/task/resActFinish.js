import { queryActivityById, saveprocActivityFinishApply } from '@/services/user/task/task';
import { doApprove, doReject } from '@/services/user/expense/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'resActFinishCreate',

  state: {},

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryActivityById, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: response,
        });
      }
    },

    *save({ payload }, { call, put }) {
      const { response } = yield call(saveprocActivityFinishApply, payload);

      if (response && response.ok) {
        if (payload.apprId) {
          // 再次提交流程
          const result = yield call(doApprove, { taskId: payload.apprId, remark: '' });
          if (result.status === 200) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process`);
          } else if (result.status === 100) {
            // 主动取消请求，不做操作
          } else {
            createMessage({ type: 'error', description: '操作失败' });
          }
        } else {
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/flow/process`);
        }
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: `操作未成功，原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
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
};
