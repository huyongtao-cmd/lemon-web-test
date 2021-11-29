import { findTaskChangeById } from '@/services/user/task/change';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userTaskChangeView',

  state: {
    formData: {},
    dataList: [],
    changeTableList: [],
    changeFormData: {},
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {}, // taskView
          dataList: [], // taskView.resActivityList
          changeTableList: [], // taskChangedtlViews
          changeFormData: {}, // taskChangeView 变更主表实体类
          fieldsConfig: {},
          flowForm: {
            remark: undefined,
            dirty: false,
          },
        },
      });
    },

    *query({ payload }, { call, put }) {
      const { status, response } = yield call(findTaskChangeById, payload.id);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const { taskView = {}, taskChangeView = {}, taskChangedtlViews = [] } = response.datum;
        const dataList =
          taskView && Array.isArray(taskView.resActivityList) ? taskView.resActivityList : [];
        yield put({
          type: 'updateState',
          payload: {
            formData: taskView,
            changeFormData: taskChangeView || {},
            // formData: {
            //   ...taskView,
            //   changeDesc: taskChangeView && taskChangeView.changeDesc,
            //   changeId: taskChangeView && taskChangeView.changeId,
            //   changeApprStatus: taskChangeView && taskChangeView.apprStatus,
            // },
            dataList,
            changeTableList: taskChangedtlViews,
          },
        });
      } else if (response.errCode) {
        createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '查询失败,请联系管理员' });
      }
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
