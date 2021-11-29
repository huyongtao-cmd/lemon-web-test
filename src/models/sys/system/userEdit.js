import { closeThenGoto } from '@/layouts/routerControl';
import {
  findUserById,
  update,
  getUserRaabs,
  updateUserRoles,
  updateUserRaabs,
  updateUserFlowRoles,
  getUserFlowRoles,
} from '@/services/sys/iam/users';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysuserEdit',

  state: {
    roleCodes: [],
    flowRoleCodes: [],
    raabCodes: [],
    formData: {
      type: undefined,
      name: undefined,
      login: undefined,
      title: undefined,
      password: undefined,
      roles: undefined,
      email: undefined,
      phone: undefined,
      signUpTime: undefined,
      activeTime: undefined,
      builtIn: undefined,
      disabled: undefined,
    },
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put, all }) {
      const {
        user: { response },
        raabs: { response: raabsResponse },
        flowRoleCodes: { response: flowRoleCodesResponse },
      } = yield all({
        user: call(findUserById, payload.id),
        raabs: call(getUserRaabs, payload.id),
        flowRoleCodes: call(getUserFlowRoles, payload.id),
      });
      yield put({
        type: 'updateState',
        payload: {
          formData: response || {},
          roleCodes: Array.isArray(response.roles) ? response.roles.map(role => role.code) : [],
          raabCodes: Array.isArray(raabsResponse) ? raabsResponse.map(raab => raab.code) : [],
          flowRoleCodes: Array.isArray(flowRoleCodesResponse)
            ? flowRoleCodesResponse.map(role => role.code)
            : [],
        },
      });
    },
    *save({ payload }, { call, put, select }) {
      const { id, params } = payload;
      // 编辑的保存方法
      const data = yield call(update, id, params);
      if (data.status === 200 && typeof data.response !== typeof 500) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/sys/system/user');
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    *saveRoles({ payload }, { call }) {
      const { id, roleCodes } = payload;
      const data = yield call(updateUserRoles, id, roleCodes);
      if (data.status === 200) {
        createMessage({ type: 'success', description: '提交成功' });
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    *saveFlowRoles({ payload }, { call }) {
      // console.log('--------payload-----', payload);
      const data = yield call(updateUserFlowRoles, payload);
      if (data.status === 200) {
        createMessage({ type: 'success', description: '提交成功' });
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    *saveRaabs({ payload }, { call }) {
      const { id, raabCodes } = payload;
      const data = yield call(updateUserRaabs, id, raabCodes);
      if (data.status === 200) {
        createMessage({ type: 'success', description: '提交成功' });
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            type: undefined,
            name: undefined,
            login: undefined,
            title: undefined,
            password: undefined,
            roles: undefined,
            email: undefined,
            phone: undefined,
            signUpTime: undefined,
            activeTime: undefined,
            builtIn: undefined,
            disabled: undefined,
          },
        },
      });
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
  },
};
