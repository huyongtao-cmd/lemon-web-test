import { queryCustExpDetailById } from '@/services/user/expense/custExp';
import { getViewConf, cancelFlow } from '@/services/gen/flow';

export default {
  namespace: 'custExpDetail',

  state: {
    formData: {},
    dataList: [],
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
  },

  effects: {
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
          dataList: [],
        },
      });
    },
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryCustExpDetailById, payload);
      if (response.ok) {
        const { datum = {} } = response;
        const dataList = Array.isArray(datum.listCustAxpApplyDView)
          ? datum.listCustAxpApplyDView
          : [];
        yield put({
          type: 'updateState',
          payload: {
            formData: datum,
            dataList,
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
              dirty: false,
            },
          },
        });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
