import { getCourseApplyFn, courseApplyHandleFn } from '@/services/user/growth';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { equals, type, isNil, isEmpty } from 'ramda';

export default {
  namespace: 'growthCourse',

  state: {
    fieldsConfig: {
      buttons: [],
      panels: {
        disabledOrHidden: {},
      },
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    formData: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getCourseApplyFn, payload.id);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum,
          },
        });
      }
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: isEmpty(response)
              ? {
                  buttons: [],
                  panels: {
                    disabledOrHidden: {},
                  },
                }
              : response,
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
    },

    *courseApplyHandle({ payload }, { call, put }) {
      const { response } = yield call(courseApplyHandleFn, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/user/flow/process');
      }
    },

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {},
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
