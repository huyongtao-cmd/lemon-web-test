import { createCms, detailCms, editCms } from '@/services/sys/market/cms';
import moment from 'moment';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'sysCmsCreate',

  state: {
    formData: {
      title: null,
      contents: null,
      remark: null,
      categoryCode: null,
      enableFlag: null,
      releaseTime: moment().format('YYYY-MM-DD'),
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(detailCms, payload);
      const { datum, ok } = response;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: datum || {},
          },
        });
      }
    },

    *create({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysCmsCreate }) => sysCmsCreate);
      const { status, response } = yield call(createCms, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(`/plat/contentMgmt/cms`);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },

    *edit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysCmsCreate }) => sysCmsCreate);

      if (payload.defId) {
        Object.assign(formData, { id: payload.defId });
      }
      const { status, response } = yield call(editCms, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(`/plat/contentMgmt/cms`);
      } else {
        createMessage({ type: 'error', description: '保存失败' });
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    clearForm(state, { payload }) {
      return {
        formData: {
          title: null,
          contents: null,
          remark: null,
          categoryCode: null,
          enableFlag: null,
          releaseTime: moment().format('YYYY-MM-DD'),
        },
      };
    },
  },
};
