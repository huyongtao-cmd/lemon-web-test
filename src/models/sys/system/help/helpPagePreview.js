import createMessage from '@/components/core/AlertMessage';

import { helpPageDetail, helpPageTree, helpPagePreviewByUrl } from '@/services/sys/system/help';

import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'helpPagePreview',
  state: {
    formData: {},
    tree: [],
    defaultSelectedKeys: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(helpPageDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...response },
            defaultSelectedKeys: [response.id + ''],
          },
        });
      }
    },

    *previewByUrl({ payload }, { call, put }) {
      const { status, response } = yield call(helpPagePreviewByUrl, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...response },
            defaultSelectedKeys: [response.id + ''],
          },
        });
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
