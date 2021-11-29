import router from 'umi/router';
import { resTemporaryDetailsRq, resMessageUpdateRq } from '@/services/plat/res/resprofile';

import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { isEmpty } from 'ramda';

export default {
  namespace: 'customerFlow',

  state: {
    abNo: '',
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
  },

  effects: {
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: isEmpty(response)
              ? {
                  buttons: [],
                  panels: {},
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
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
