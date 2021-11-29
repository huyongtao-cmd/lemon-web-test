import { pronationListRq, pronationDetailRq } from '@/services/plat/res/resprofile';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};

export default {
  namespace: 'probation',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { probation, buPicRegularDate, ...params } = payload;
      if (Array.isArray(probation) && (probation[0] || probation[1])) {
        [params.startDate, params.endDate] = probation;
      }
      if (Array.isArray(buPicRegularDate) && (buPicRegularDate[0] || buPicRegularDate[1])) {
        [params.buPicRegularDateStart, params.buPicRegularDateEnd] = buPicRegularDate;
      }
      const { response } = yield call(pronationListRq, params);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(pronationDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateForm',
            payload: response.datum || {},
          });
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      return {};
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
        list: [],
        total: 0,
      };
    },
  },
};
