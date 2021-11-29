import {
  queryResEnrollInfo,
  queryResEnrollCreateInfo,
  createResEnroll,
  delResEnroll,
  getCreateInfo,
} from '@/services/plat/res/resprofile';
import { getViewConf, cancelFlow } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'platResEnrollDetail',

  state: {
    formData: {},
    formDataSource: {},
    createData: {},
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    haveLoginName: 0,
    roles: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formDataSource: {},
        },
      });
      const { status, response } = yield call(queryResEnrollInfo, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formDataSource: response.datum || {},
          },
        });
      }
    },

    *queryCreate({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
        },
      });
      const { status, response } = yield call(queryResEnrollCreateInfo, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
            haveLoginName: response.datum.loginName ? 1 : 0,
          },
        });
      }
    },

    *queryCreateInfo({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          createData: {},
        },
      });
      const { status, response } = yield call(getCreateInfo, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            createData: response.datum || {},
          },
        });
      }
    },

    *create({ payload }, { call, put, select }) {
      const { formData } = yield select(({ platResEnrollDetail }) => platResEnrollDetail);
      const { newEnrollDate } = formData;
      if (newEnrollDate && typeof newEnrollDate !== 'string') {
        formData.enrollDate = newEnrollDate.format('YYYY-MM-DD');
      }
      const { status, response } = yield call(createResEnroll, formData);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (!response.ok) {
        createMessage({ type: 'warn', description: response.reason || '提交失败' });
        return false;
      }
      return true;
    },

    *del({ payload }, { call, put, select }) {
      const { status, response } = yield call(delResEnroll, payload);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (!response.ok) {
        createMessage({ type: 'warn', description: response.reason || '关闭失败' });
        return false;
      }
      return true;
    },

    *cancel({ payload }, { call, put, select }) {
      const { status, response } = yield call(cancelFlow, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        createMessage({ type: 'success', description: '关闭成功' });
        closeThenGoto('/user/flow/process');
      }
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
