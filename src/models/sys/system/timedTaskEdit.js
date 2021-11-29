import { timedTaskUpdate, getTimedTaskDetail } from '@/services/sys/system/timedTask';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'sysTimedTaskEdit',
  state: {
    // TODO
    formData: {
      taskCode: undefined, // 任务编码
      taskName: undefined, // 任务名称
      taskDesc: undefined, // 任务描述
      cron: undefined, // cron表达式
      enable: undefined, // 是否启用
      className: undefined, // 任务类
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getTimedTaskDetail, payload.id);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
          },
        });
      }
    },
    *save({ payload }, { call }) {
      const { isCreate, ...restProps } = payload;
      const data = yield call(timedTaskUpdate, { ...restProps });
      if (data.status === 200) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto(`/sys/system/scheduledtask`);
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            taskCode: undefined, // 任务编码
            taskName: undefined, // 任务名称
            taskDesc: undefined, // 任务描述
            cron: undefined, // cron表达式
            enable: undefined, // 是否启用
            className: undefined, // 任务类
          },
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
