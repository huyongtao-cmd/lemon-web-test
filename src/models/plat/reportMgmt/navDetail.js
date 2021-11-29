import { queryRelated, queryParam } from '@/services/sys/system/report';

export default {
  namespace: 'reportNavDetail',
  state: {
    btnSource: [],
    paramData: [],
    formData: {},
    parameter: {
      id: null,
      code: null,
      url: null,
    },
    iframeSrc: '',
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryRelated, payload);
      if (status === 100) return;
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            btnSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    *queryParam({ payload }, { call, put }) {
      const { status, response } = yield call(queryParam, payload);
      if (status === 100) return [];
      if (response.ok) {
        const paramData = Array.isArray(response.datum) ? response.datum : [];
        const formData = {};
        paramData.forEach(v => {
          formData[v.parameVar] = v.parameVal;
        });
        yield put({
          type: 'updateState',
          payload: {
            paramData,
            formData,
          },
        });
        return paramData;
      }
      return [];
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
