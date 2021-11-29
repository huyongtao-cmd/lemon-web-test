/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
import {
  findExpenseById,
  saveExpense,
  updateAdjustedAmt,
  getMealFeeRq,
} from '@/services/user/expense/expense';
import { doApprove, doReject } from '@/services/user/expense/flow';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf, pushFlowTask } from '@/services/gen/flow';
import { closeThenGoto, closeTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { clone } from 'ramda';
import { getCostSharingById, postCostSharing } from '@/services/org/bu/buReimbursementList';
import { postExamCostSharingTask } from '@/services/org/bu/costSharingList';
import { launchFlowFn } from '@/services/sys/flowHandle';
import { selectBuMultiCol } from '@/services/org/bu/bu';

import moment from 'moment';

export default {
  namespace: 'buReimbursementDetail',
  state: {
    formData: {},
    sharingData: {}, // 分摊信息
    detailList: [], // 分摊列表
    fieldsConfig: {
      panels: [],
    },
    baseBuDataSource: [],
    flowForm: {
      remark: undefined,
      dirty: false,
    },
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {},
          detailList: [],
          fieldsConfig: {
            panels: [],
          },
          flowForm: {
            remark: undefined,
            dirty: false,
          },
        },
      });
    },

    *query({ payload }, { call, put }) {
      yield put({
        type: 'clean',
      });
      const { id } = payload;
      const { status, response } = yield call(getCostSharingById, id);
      if (status === 200) {
        const { datum = {} } = response;
        yield put({
          type: 'updateState',
          payload: {
            formData:
              {
                ...datum.reimDetailView,
                sharingNo: datum.sharingNo,
                busitripApplyName:
                  datum.reimDetailView.applyView && datum.reimDetailView.applyView.applyName,
              } || {},
            sharingData: {
              reimAmt: datum.reimAmt,
              applicantTime: datum.applicantTime,
              sharingStatus: datum.sharingStatus,
              applicantResId: datum.applicantResId,
            },
            detailList: datum.sharingDetailView,
          },
        });
        return response;
      }
      if (status === 100) {
        // 主动取消请求
        return 0;
      }
      createMessage({ type: 'error', description: response.reason });
      return 0;
    },

    *submit({ payload }, { call, put }) {
      const { response } = yield call(postCostSharing, payload);
      if (response && response.ok) {
        const responseFlow = yield call(launchFlowFn, {
          defkey: 'ACC_A63',
          value: {
            id: response.datum.id,
          },
        });
        const response2 = responseFlow.response;
        if (response2 && response2.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto('/org/bu/buReimbursementList/index?_refresh=0');
        }
      }
    },

    *flowSubmit({ payload }, { call, put }) {
      const { response } = yield call(postCostSharing, payload);
      if (response) return response;
      return 0;
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
    *updateBuFlow({ payload }, { call, put }) {
      const { status, response } = yield call(postExamCostSharingTask, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { from } = fromQs();
        const url = getUrl(from);
        url ? closeThenGoto(url) : closeTab();
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuDataSource: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: { baseBuId: '', baseBuName: '' },
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateSharingData(state, { payload }) {
      const { sharingData } = state;
      const newFormData = { ...sharingData, ...payload };
      return {
        ...state,
        sharingData: newFormData,
      };
    },
  },
};
