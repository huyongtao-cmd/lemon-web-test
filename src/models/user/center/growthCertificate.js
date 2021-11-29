import { getCertFn, applyCertFn, flowCertFn } from '@/services/user/growth';
import { launchFlowFn, passAndReturnFlowFn } from '@/services/sys/flowHandle';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { equals, type, isNil, isEmpty } from 'ramda';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'growthCertificate',

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
    *getCertFnHandle({ payload }, { call, put }) {
      const { response } = yield call(getCertFn, payload.id);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
          },
        });
      }
    },
    *saveApplyCertFn({ payload }, { call, put }) {
      const { response } = yield call(applyCertFn, payload);
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'ACC_A54',
          value: {
            id: response.datum,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto('/user/flow/process');
        }
      }
    },

    *saveflowCertFn({ payload }, { call, put }) {
      const { response } = yield call(flowCertFn, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/user/flow/process');
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },
};
