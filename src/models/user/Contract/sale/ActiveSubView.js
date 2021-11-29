import { getViewSubContract, passResultSubContract } from '@/services/plat/prePayMgmt';
import { procurDemandDetailRq } from '@/services/user/Contract/purchaseDemandDeal';
import { getViewConf } from '@/services/gen/flow';
import { isEmpty, clone } from 'ramda';

import { launchFlowFn, reSubmission } from '@/services/sys/flowHandle';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import router from 'umi/router';
import { getUrl } from '@/utils/flowToRouter';

export default {
  namespace: 'activeSubContractView',

  state: {
    formData: {},
    ruleList: [],
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      salesmanResId: undefined,
      dirty: false,
    },
    procurDemandDViews: [],
    subContractId: null,
  },

  effects: {
    *procurDemandDetail({ payload }, { call, put }) {
      const { status, response } = yield call(procurDemandDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const { procurDemandDViews, ...newFormData } = response.datum;
        yield put({
          type: 'updateState',
          payload: {
            procurDemandDViews,
          },
        });
        yield put({
          type: 'updateForm',
          payload: newFormData,
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '获取采购需求处理信息失败',
        });
      }
    },
    *query({ payload }, { call, put }) {
      const { response } = yield call(getViewSubContract, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
            ruleList: Array.isArray(response.datum.profitAgreeList)
              ? response.datum.profitAgreeList
              : [],
            subContractId: response.datum?.id,
          },
        });
        return response;
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
              salesmanResId: undefined,
              dirty: false,
            },
          },
        });
      }
    },

    *passResult({ payload }, { call, put }) {
      const { response } = yield call(passResultSubContract, payload);

      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },

    *submission({ payload }, { call, put }) {
      const { response } = yield call(reSubmission, payload.taskId);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
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
    clearForm(state, { payload }) {
      return {
        formData: {},
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
