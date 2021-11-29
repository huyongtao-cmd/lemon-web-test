import { createUdc, eidtUdc, detailUdc, selectUdc } from '@/services/sys/system/udc';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'sysUdcInfo',

  state: {
    formData: {
      defId: null,
      defName: null,
      isBuiltIn: null,
      pDefId: null,
    },
    udcData: [],
    udcDataSource: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(detailUdc, payload);
      yield put({
        type: 'updateState',
        payload: {
          formData: response.datum || {},
        },
      });
    },

    *selectUdc({ payload }, { call, put }) {
      const { response } = yield call(selectUdc);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          udcData: list,
          udcDataSource: list,
        },
      });
    },

    *create({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysUdcInfo }) => sysUdcInfo);
      const { status, response } = yield call(createUdc, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(`/sys/system/udc`);
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },

    *edit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysUdcInfo }) => sysUdcInfo);
      const { status, response } = yield call(eidtUdc, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(`/sys/system/udc`);
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
          defId: null,
          defName: null,
          isBuiltIn: null,
          pDefId: null,
        },
      };
    },
  },
};
