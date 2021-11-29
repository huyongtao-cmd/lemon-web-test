import {
  getCapaAccEssView,
  submitCapaAccEssViewFn,
  getCapaAccEssViewById,
  capaAccEssViewFlowFn,
} from '@/services/user/growth';
import { launchFlowFn } from '@/services/sys/flowHandle';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { equals, type, isNil, isEmpty } from 'ramda';

export default {
  namespace: 'growthCompoundPermission',

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
    dataSource: {},
    flowDataSource: {},
    formData: {},
  },

  effects: {
    *save({ payload }, { call, put }) {
      const { response } = yield call(submitCapaAccEssViewFn, payload);
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'ACC_A67',
          value: {
            id: response.datum,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto('/user/flow/process');
        } else {
          createMessage({ type: 'error', description: '提交失败' });
        }
      }
    },
    *approve({ payload }, { call, put }) {
      const { response } = yield call(capaAccEssViewFlowFn, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        return response;
      }
      createMessage({ type: 'error', description: '操作失败' });
      return {};
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
    *getCapaAccEssView({ payload }, { call, put }) {
      const { response } = yield call(getCapaAccEssView, payload.id);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.datum,
          },
        });
      }
    },
    *getCapaAccEssViewById({ payload }, { call, put }) {
      const { response } = yield call(getCapaAccEssViewById, payload.id);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            flowDataSource: response.datum,
          },
        });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
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
      return {
        ...state,
        formData: {
          ...state.formData,
          ...payload,
        },
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
