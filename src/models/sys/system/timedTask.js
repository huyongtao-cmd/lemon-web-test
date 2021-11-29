import {
  getTimedTaskList,
  timedTaskStartHandle,
  timedTaskStopHandle,
  timedTaskQuickStartHandle,
  timedTaskNowStartRq,
} from '@/services/sys/system/timedTask';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  nameLike: undefined,
  custom: undefined,
  disabled: undefined,
};

export default {
  namespace: 'sysTimedTask',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getTimedTaskList, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },

    *timedTaskNowStart({ payload }, { call, select, put }) {
      const { status, response } = yield call(timedTaskNowStartRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const { searchForm } = yield select(({ sysroles }) => sysroles);
          yield put({ type: 'query', payload: searchForm });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },

    *startTimedTask({ payload }, { call, select, put }) {
      const { taskCode } = payload;
      const data = yield call(timedTaskStartHandle, taskCode);
      if (data.status === 200) {
        const { searchForm } = yield select(({ sysroles }) => sysroles);
        yield put({ type: 'query', payload: searchForm });
      }
    },

    *stopTimedTask({ payload }, { call, select, put }) {
      const { taskCode } = payload;
      const data = yield call(timedTaskStopHandle, taskCode);
      if (data.status === 200) {
        const { searchForm } = yield select(({ sysroles }) => sysroles);
        yield put({ type: 'query', payload: searchForm });
      }
    },

    *startTimedTaskQuick({ payload }, { call, select, put }) {
      const data = yield call(timedTaskQuickStartHandle);
      if (data.status === 200) {
        const { searchForm } = yield select(({ sysroles }) => sysroles);
        yield put({ type: 'query', payload: searchForm });
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
  },
};
