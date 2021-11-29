import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { modifiedRole } from '@/services/sys/system/flowRole';

const defaultFormData = {
  flowRoleCode: undefined,
  flowRoleName: undefined,
  isMoreUser: false,
  roleStatus: false,
  remark: undefined,
  userIds: [],
  baseCitys: [],
  defaultFlag: false,
};

export default {
  namespace: 'flowRoleCreate',
  state: {
    formData: defaultFormData,
  },
  effects: {
    *save({ payload }, { call, put }) {
      const { isMoreUser, roleStatus, defaultFlag, ...rest } = payload;
      const newPayload = {
        ...rest,
        isMoreUser: isMoreUser ? 1 : 0,
        roleStatus: roleStatus ? 1 : 0,
        defaultFlag: defaultFlag ? 1 : 0,
      };
      const { response, status } = yield call(modifiedRole, newPayload);
      if (status === 200) {
        createMessage({ type: 'success', description: '创建成功' });
        closeThenGoto('/sys/flowMen/flow/roles');
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    cleanFormData(state, action) {
      return {
        ...state,
        formData: defaultFormData,
      };
    },
  },
};
