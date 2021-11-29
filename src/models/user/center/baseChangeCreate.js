import { baseBuInfo, saveBaseBUInfo, getBaseViewList } from '@/services/user/baseBUChange';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { equals, type, isNil, isEmpty } from 'ramda';
import { launchFlowFn } from '@/services/sys/flowHandle';

export default {
  namespace: 'changeBase',

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
    // 根据资源ID查找baseBU信息和上级资源
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(baseBuInfo, payload.resId);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...response.datum, ...payload },
          },
        });
      }
    },

    // baseBU变更提交，发起流程
    *baseBUChangeApply({ payload }, { call, put }) {
      const { response } = yield call(saveBaseBUInfo, payload);
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'ACC_A61',
          value: {
            id: response.datum,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '申请提交成功' });
          closeThenGoto('/user/flow/process');
          return true;
        }
        createMessage({ type: 'error', description: response2.reason || '申请提交失败' });
        return false;
      }
      createMessage({ type: 'error', description: response.reason || '申请提交失败' });
      return false;
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
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
