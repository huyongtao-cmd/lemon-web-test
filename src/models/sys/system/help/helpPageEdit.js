import createMessage from '@/components/core/AlertMessage';

import {
  helpPageCreate,
  helpPageModify,
  helpPageDetail,
  helpPageTree,
} from '@/services/sys/system/help';

import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'helpPageEdit',
  state: {
    formData: {},
    tree: [],
    editorContent: '',
    loadFinish: false,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(helpPageDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...response,
              linkUrl: response.linkUrl ? response.linkUrl.replace(/;/g, ';\r\n') : undefined,
            },
            editorContent: response.helpContent || '',
            loadFinish: true,
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        response = yield call(helpPageModify, payload);
      } else {
        // 新增
        response = yield call(helpPageCreate, payload);
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
        closeThenGoto(`/sys/maintMgmt/help`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
      }
    },

    *getTree({ payload }, { call, put }) {
      const { status, response } = yield call(helpPageTree, payload);
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
