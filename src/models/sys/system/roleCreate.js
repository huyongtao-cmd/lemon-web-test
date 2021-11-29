import { create } from '@/services/sys/iam/roles';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysroleCreate',

  state: {
    formData: {
      builtIn: undefined,
      code: undefined,
      disabled: undefined,
      name: undefined,
      navs: undefined,
      pcode: undefined,
      raabs: undefined,
      remark: undefined,
    },
  },

  effects: {
    *save({ payload }, { call }) {
      const { isCreate, ...restProps } = payload;
      const data = yield call(create, { ...restProps });
      if (data.status === 200) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto(`/sys/powerMgmt/role/edit?id=${restProps.code}`);
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
            builtIn: undefined,
            code: undefined,
            disabled: undefined,
            name: undefined,
            navs: undefined,
            pcode: undefined,
            raabs: undefined,
            remark: undefined,
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
