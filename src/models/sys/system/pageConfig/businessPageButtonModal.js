import createMessage from '@/components/core/AlertMessage';

import {
  businessPageButtonList,
  businessPageButtonSaveOrUpdate,
} from '@/services/sys/system/pageConfig';

export default {
  namespace: 'businessPageButtonModal',
  state: {
    pageId: undefined,
    dataSource: [],
    deleteKeys: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(businessPageButtonList, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...response },
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      const response = yield call(businessPageButtonSaveOrUpdate, payload);

      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
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
