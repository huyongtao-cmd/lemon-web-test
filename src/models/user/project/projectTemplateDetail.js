import { formatDT } from '@/utils/tempUtils/DateTime';
import { queryProjectTemplate } from '@/services/user/project/project';
import { selectFinperiod } from '@/services/user/Contract/sales';

export default {
  namespace: 'projectTemplateDetail',
  state: {
    formData: {},
    activityList: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryProjectTemplate, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.tmpl,
            activityList: response.tmplActs.slice(),
          },
        });
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
