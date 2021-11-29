import router from 'umi/router';
import { pwdChange } from '@/services/user/center/pwdChange';
import createMessage from '@/components/core/AlertMessage';
import { convertCode } from '@/components/core/I18n/convert';

export default {
  namespace: 'userCenterPwdChange',

  state: {
    formData: {
      oldPwd: null, // 旧密码
      newPwd: null, // 新密码
      newPwdConfirm: null, // 确认密码
    },
  },

  effects: {
    *save(_, { call, put, select }) {
      const { formData } = yield select(({ userCenterPwdChange }) => userCenterPwdChange);
      if (formData.oldPwd === formData.newPwd) {
        createMessage({ type: 'error', description: '旧密码和新密码一致' });
        return;
      }
      if (formData.newPwd !== formData.newPwdConfirm) {
        createMessage({ type: 'error', description: '新密码和确认密码不一致' });
        return;
      }
      const { status, response } = yield call(pwdChange, {
        oldPwd: formData.oldPwd,
        newPwd: formData.newPwd,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '密码修改成功，请重新登录' });
        yield put({
          type: 'login/logout',
        });
      } else {
        if (response.errCode) {
          createMessage({
            type: 'error',
            description: '密码修改失败：' + convertCode(response.errCode),
          });
          return;
        }
        createMessage({ type: 'error', description: '密码修改失败' });
      }
    },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ userCenterPwdChange }) => userCenterPwdChange);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            oldPwd: null, // 旧密码
            newPwd: null, // 新密码
            newPwdConfirm: null, // 确认密码
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        // dispatch({ type: 'clean' });
      });
    },
  },
};
