import createMessage from '@/components/core/AlertMessage';

import {
  helpDirectoryCreate,
  helpDirectoryModify,
  helpDirectoryDetail,
  helpDirectoryTree,
} from '@/services/sys/system/help';

import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'helpDirectoryEdit',
  state: {
    formData: {},
    tree: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(helpDirectoryDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        response = yield call(helpDirectoryModify, payload);
      } else {
        // 新增
        response = yield call(helpDirectoryCreate, payload);
      }
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 保存成功
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
          },
        });
        closeThenGoto(`/sys/maintMgmt/help/directory`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
      }
    },

    *getTree({ payload }, { call, put }) {
      const { status, response } = yield call(helpDirectoryTree, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            tree: response,
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
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
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
