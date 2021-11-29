import { isEmpty } from 'ramda';
import { getTask, getPointCC, pointCC, getPointTo, pointTo } from '@/services/sys/flowMgmt';

export default {
  namespace: 'flowConfig',
  state: {
    formData: {},
    list: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(getTask, payload);
      if (status === 200 && !isEmpty(response)) {
        const { taskDefs, taskAssignments } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(taskDefs) ? taskDefs : [],
            formData: taskAssignments,
          },
        });
      }
    },
    *getFlowCC({ payload }, { call, put }) {
      const { defId, taskKey } = payload;
      const { status } = yield call(getPointCC, defId, taskKey);
      if (status === 200) {
        // TODO: updateForm
      }
    },
    *flowCC({ payload }, { call, put }) {
      const { defId, taskKey, ...params } = payload;
      const { status } = yield call(pointCC, defId, taskKey, params);
      if (status === 200) {
        return true;
      }
      return false;
    },
    *getFlowTo({ payload }, { call, put }) {
      const { defId, taskKey } = payload;
      const { status } = yield call(getPointTo, defId, taskKey);
      if (status === 200) {
        // TODO: updateForm
      }
    },
    *flowTo({ payload }, { call, put }) {
      const { defId, taskKey, ...params } = payload;
      const { status } = yield call(pointTo, defId, taskKey, params);
      if (status === 200) {
        return true;
      }
      return false;
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
