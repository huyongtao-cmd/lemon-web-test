import { closeThenGoto } from '@/layouts/routerControl';
import { create } from '@/services/sys/iam/users';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysuserCreate',

  state: {
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
      resId: undefined,
    },
    custData: [],
    custDataSource: [],
  },

  effects: {
    *save({ payload }, { call, put, select }) {
      const { formData } = yield select(({ sysuserCreate }) => sysuserCreate);
      // 新增的保存方法
      const data = yield call(create, formData);
      if (data.status === 200) {
        if (data.code === 'NG') {
          // 后台报错
          let reason =
            data.response[0].code === 'NG_POOR_PASSWORD'
              ? '密码强度不足，请重设密码'
              : '提交失败,请联系管理员';
          reason = data.response[0].code === 'NG_KEY_EXISTS' ? '数据已存在' : reason;
          createMessage({ type: 'error', description: reason });
          return;
        }
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto(`/sys/system/user/edit?id=${data.response}`);
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
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
  },
};
