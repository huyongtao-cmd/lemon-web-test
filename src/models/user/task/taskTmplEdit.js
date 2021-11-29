import createMessage from '@/components/core/AlertMessage';

import { taskTmplCreate, taskTmplModify, taskTmplDetail } from '@/services/user/task/task';

import { closeThenGoto } from '@/layouts/routerControl';
import { clone } from 'ramda';

export default {
  namespace: 'taskTmplEdit',
  state: {
    formData: {},
    dataSource: [],
    deleteKeys: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(taskTmplDetail, payload);
      if (status === 200) {
        const dataSource = clone(Array.isArray(response.rows) ? response.rows : []);
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            dataSource: Array.isArray(response.dtlViews) ? response.dtlViews : [],
            deleteKeys: [],
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.entity.id) {
        response = yield call(taskTmplModify, payload);
      } else {
        // 新增
        response = yield call(taskTmplCreate, payload);
      }
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 保存成功
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
            dataSource: [],
            deleteKeys: [],
          },
        });
        closeThenGoto(`/user/task/tmpl`);
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
