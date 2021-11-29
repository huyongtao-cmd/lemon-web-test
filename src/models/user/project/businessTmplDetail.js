import { templateResPlanningDetailUri } from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'businessTmplDetail',
  state: {
    formData: {},
    dataSource: [],
    withdrawPayFlow: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(templateResPlanningDetailUri, payload);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: (response.datum || {}).planningTitle,
              dataSource: Array.isArray((response.datum || {}).details)
                ? (response.datum || {}).details
                : [],
            },
          });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      return null;
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
