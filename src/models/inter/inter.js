import createMessage from '@/components/core/AlertMessage';
import {
  insertDeptToU8c,
  insertCustSupplierToU8c,
  insertPsnToU8c,
  insertAccToU8c,
} from '@/services/production/inter/inter';

export default {
  namespace: 'interface',

  state: {},

  effects: {
    *insertDeptToU8cFn({ payload }, { call, put }) {
      const response = yield call(insertDeptToU8c, payload);
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '同步成功' });
      } else {
        createMessage({
          type: 'warn',
          description: response?.response?.errors[0]?.msg || '保存失败',
        });
      }
    },
    *insertCustSupplierToU8cFn({ payload }, { call, put }) {
      const response = yield call(insertCustSupplierToU8c, payload);
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '同步成功' });
      } else {
        createMessage({
          type: 'warn',
          description: response?.response?.errors[0]?.msg || '保存失败',
        });
      }
    },
    *insertPsnToU8cFn({ payload }, { call, put }) {
      const response = yield call(insertPsnToU8c, payload);
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '同步成功' });
      } else {
        createMessage({
          type: 'warn',
          description: response?.response?.errors[0]?.msg || '保存失败',
        });
      }
    },
    *insertAccToU8cFn({ payload }, { call, put }) {
      const response = yield call(insertAccToU8c, payload);
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '同步成功' });
      } else {
        createMessage({
          type: 'warn',
          description: response?.response?.errors[0]?.msg || '保存失败',
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
