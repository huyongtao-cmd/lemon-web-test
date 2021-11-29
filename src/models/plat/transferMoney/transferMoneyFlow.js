import {
  setUpProjectCreateDetailRq,
  setUpProjectCreateUriRq,
  setUpProjectBUDetailUriRq,
  contractSourceUriRq,
  contractSourceDetailUriRq,
  setUpProjectBUCreateUriRq,
  setUpProjectSalesManCreateUriRq,
  setUpProjectPmoCreateUriRq,
  setUpProjectProjManagerCreateUriRq,
} from '@/services/plat/transferMoney';
import { getViewConf } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';

export default {
  namespace: 'transferMoneyFlow',
  state: {
    formData: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },
  effects: {
    // 申请人重新提交项目
    *submit({ payload }, { call, put, select }) {
      const { status, response } = yield call(setUpProjectCreateUriRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      }
      return {};
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
        return response;
      }
      return {};
    },
    *clean(_, { call, put }) {
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
    updateForm(state, { payload }) {
      const { queryData } = state;
      const newQueryData = { ...queryData, ...payload };
      return {
        ...state,
        queryData: newQueryData,
      };
    },
    updateForm1(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
