import createMessage from '@/components/core/AlertMessage';

import {
  businessPagePermissionList,
  businessPagePermissionSaveOrUpdate,
} from '@/services/sys/system/pageConfig';
import { selectPageField, selectBuPageField } from '@/services/gen/list';

export default {
  namespace: 'businessPagePermissionModal',
  state: {
    formData: {
      allowType: 'ROLE',
    },
    pageField: [],
    buPageField: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(businessPagePermissionList, payload);
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
      const response = yield call(businessPagePermissionSaveOrUpdate, payload);

      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
      }
    },

    // 当选中的允许类型为表单资源字段时，获取表单资源字段下拉数据
    *queryPageField({ payload }, { call, put }) {
      const { response } = yield call(selectPageField, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            pageField: Array.isArray(response) ? response : [],
          },
        });
      }
    },

    // 当选中的允许类型为表单BU字段时，获取表单BU字段下拉数据
    *queryBUPageField({ payload }, { call, put }) {
      const { response } = yield call(selectBuPageField, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            buPageField: Array.isArray(response) ? response : [],
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
