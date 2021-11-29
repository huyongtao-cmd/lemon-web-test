import { queryReportDetail, queryRoleList, saveRole } from '@/services/sys/system/report';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'reportMgtDetail',
  state: {
    formData: {},
    dataSource: [],
    roleData: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryReportDetail, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
          },
        });
      }
    },

    *queryRoleList({ payload }, { call, put }) {
      const { response } = yield call(queryRoleList, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            roleData: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    *saveRole({ payload }, { call, put }) {
      const { reportCode, paramId, roles } = payload;
      const { response } = yield call(
        saveRole,
        {
          reportCode,
          paramId,
        },
        roles
      );
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // closeThenGoto('/sys/system/report');
        return;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
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
