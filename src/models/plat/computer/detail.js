import { findComputerById } from '@/services/plat/computer';
import { getViewConf, pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'platComputerApplyDetail',

  state: {
    formData: {},
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      salesmanResId: undefined,
      dirty: false,
    },
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum, reason },
      } = yield call(findComputerById, payload.id);

      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: datum || {},
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
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: { formData: {} },
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
  },
};
