import { menuEdit, getMenuInfo } from '@/services/sys/system/menuConfig';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'MenuConfigEdit',
  state: {
    formData: {},
    attachments: [],
    attachmentsSelected: [],
  },

  effects: {
    *save({ payload }, { call, put }) {
      const params = payload;
      delete params.selecteFunUrl;
      const { status, response } = yield call(menuEdit, params);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/sys/system/MenuConfig`);
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
          const { attachments = [], attachmentsSelected = [] } = detail;
          const icon = attachments.map(item => item.id);
          const iconSelected = attachmentsSelected.map(item => item.id);
          yield put({
            type: 'updateForm',
            payload: {
              ...detail,
              icon,
              iconSelected,
            },
          });
          yield put({
            type: 'updateState',
            payload: {
              attachments,
              attachmentsSelected,
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
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
