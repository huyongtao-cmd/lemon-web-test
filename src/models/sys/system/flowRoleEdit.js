import createMessage from '@/components/core/AlertMessage';
// import { closeThenGoto } from '@/layouts/routerControl';
import { getRole, modifiedRole } from '@/services/sys/system/flowRole';
import { fromQs } from '@/utils/stringUtils';

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
  namespace: 'flowRoleEdit',
  state: {
    formData: defaultFormData,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(getRole, payload.id);
      if (status === 200) {
        const { userIds, defaultFlag } = response;
        const ids = Array.isArray(userIds) ? userIds.map(id => `${id}`) : [];
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...response,
              userIds: ids,
              defaultFlag: !!defaultFlag,
            },
          },
        });
      }
    },
    *save({ payload }, { call, put }) {
      const { isMoreUser, roleStatus, defaultFlag, ...rest } = payload;
      const newPayload = {
        ...rest,
        isMoreUser: isMoreUser ? 1 : 0,
        roleStatus: roleStatus ? 1 : 0,
        defaultFlag: defaultFlag ? 1 : 0,
        id: fromQs().id,
      };
      const { response, status } = yield call(modifiedRole, newPayload);
      if (status === 200) {
        createMessage({ type: 'success', description: '修改成功' });
        // closeThenGoto('/sys/flowMen/flow/roles');
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
