import {
  getExtensionList,
  insertExtensionFn,
  getExtensionInfoFn,
  updateExtensionFn,
  deleteExtensionMenuFn,
} from '@/services/sys/system/homeConfig';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'HomeConfigExtensionMenu',
  state: {
    formData: {},
    list: [],
    attachments: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(getExtensionList, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      } else {
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *save({ payload }, { call, put }) {
      const { type } = payload;
      const params = payload;
      const api = type === 'edit' ? updateExtensionFn : insertExtensionFn;
      if (type) {
        delete params.type;
      }
      const { status, response } = yield call(api, params);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/sys/system/homeConfig/ExtensionMenu`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *getDetails({ payload }, { call, put }) {
      const { id = '' } = payload;
      const { status, response } = yield call(getExtensionInfoFn, id);
      if (status === 200) {
        if (response && response.ok) {
          const detail = response.datum ? response.datum : {};
          const { attachments = [] } = detail;
          const icon = attachments.map(item => item.id);
          yield put({
            type: 'updateForm',
            payload: {
              ...detail,
              icon,
            },
          });
          yield put({
            type: 'updateState',
            attachments,
          });
        } else {
          const message = response.reason || '获取详细信息失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(deleteExtensionMenuFn, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          yield put({
            type: 'query',
          });
        } else {
          const message = response.reason || '操作失败';
          createMessage({ type: 'warn', description: message });
        }
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
        ...state,
        formData: {},
      };
    },
  },
};
