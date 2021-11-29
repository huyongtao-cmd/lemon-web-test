import createMessage from '@/components/core/AlertMessage';

import {
  businessPageCreate,
  businessPageModify,
  businessPageDetail,
  businessTableFields,
  businessPageBlockSaveOrUpdate,
} from '@/services/sys/system/pageConfig';

export default {
  namespace: 'businessPageBlockModal',
  state: {
    formData: {},
    pageFieldEntities: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(businessPageDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...response },
          },
        });
      }
    },

    *queryBusinessTableFields({ payload }, { call, put }) {
      const { response } = yield call(businessTableFields, payload);
      if (response) {
        let fields = response.data || [];
        fields = fields.map(field => ({
          ...field,
          fieldKey: field.cameCaseFieldName,
          fieldId: field.id,
          id: undefined,
        }));
        yield put({
          type: 'updateState',
          payload: {
            pageFieldEntities: fields,
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      const response = yield call(businessPageBlockSaveOrUpdate, payload);

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
