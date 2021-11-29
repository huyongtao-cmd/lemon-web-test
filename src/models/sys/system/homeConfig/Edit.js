import {
  getHomeConfigListNav,
  getMenuInfo,
  menuCreate,
  menuEdit,
} from '@/services/sys/system/homeConfig';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'HomeConfigEdit',
  state: {
    formData: {},
    attachments: [],
  },

  effects: {
    *queryNav({ payload }, { call, put }) {
      const { status, response } = yield call(getHomeConfigListNav, payload);
      if (status === 200) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            HomeConfigListNav: Array.isArray(datum) ? datum : [],
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
      const api = type === 'edit' ? menuEdit : menuCreate;
      if (type) {
        delete params.type;
      }
      const { status, response } = yield call(api, params);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/sys/system/homeConfig/menu`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *getDetails({ payload }, { call, put }) {
      const { id = '' } = payload;
      const { status, response } = yield call(getMenuInfo, id);
      if (status === 200) {
        if (response && response.ok) {
          const detail = response.datum ? response.datum : {};
          const { attachments } = detail;
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
            payload: {
              attachments,
            },
          });
        } else {
          const message = response.reason || '获取详细信息失败';
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
