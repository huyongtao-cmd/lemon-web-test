import {
  getInfo,
  getSingleTable,
  createEquivalent,
  saveCheckEqva,
} from '@/services/user/equivalent/equivalent';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';

const defaultFlowForm = {
  remark: undefined,
  salesmanResId: {},
  dirty: false,
};

export default {
  namespace: 'SinglePreview',
  state: {
    formData: {},
    list: [],
    total: undefined,
    fieldsConfig: {},
    flowForm: defaultFlowForm,
  },
  effects: {
    *queryInfo({ payload }, { call, put, all }) {
      const { formRes, tableRes } = yield all({
        formRes: call(getInfo, { id: payload }),
        tableRes: call(getSingleTable, { id: payload }),
      });
      if (formRes.status === 200 && tableRes.status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: formRes.response.datum || {},
            list: Array.isArray(tableRes.response.datum) ? tableRes.response.datum : [],
            total: tableRes.response.total,
          },
        });
      }
    },
    *saveData({ payload }, { call }) {
      const { status, response } = yield call(createEquivalent, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        return true;
      }
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      createMessage({ type: 'error', description: '保存失败' });
      return false;
    },
    *checkAndSave({ payload }, { call }) {
      const { status, response } = yield call(saveCheckEqva, {
        procTaskId: payload.procTaskId,
        ...payload,
      });
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '审批成功' });
        return true;
      }
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      createMessage({ type: 'error', description: response.reason });
      return false;
    },
    *fetchConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: defaultFlowForm,
          },
        });
        const { taskKey } = response || {};
        // 需要判断是否第一次进入审批中的页面
        const { formData, list } = yield select(({ SinglePreview }) => SinglePreview);
        if (
          taskKey &&
          taskKey === 'ACC_A22_02_EMPLOYER_CONFIRM_b' &&
          formData.apprStatus === 'APPROVING'
        ) {
          // 进入审批界面默认 实际结算当量=理论获得当量
          const newList = list.length
            ? list.map(item => ({
                ...item,
                approveSettleEqva: item.applySettleEqva,
              }))
            : [];
          yield put({
            type: 'updateState',
            payload: { list: newList },
          });
        }
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
    cleanFlow(state, { payload }) {
      return {
        ...state,
        fieldsConfig: {},
        flowForm: defaultFlowForm,
      };
    },
  },
};
