import {
  implementListRq,
  implementEditRq,
  implementDetailRq,
  implementDelRq,
} from '@/services/okr/okrMgmt';

import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const defaultSearchForm = {};
const defaultFormData = {};

export default {
  namespace: 'implement',
  state: {
    // 实施周期数据
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    dataSource: [],
    formData: {},
    // 实施周期目标数据
    targetList: [],
    targetTotal: 0,
  },

  effects: {
    *queryTarget({ payload }, { call, put }) {
      const { status, response } = yield call(implementDetailRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            targetList: Array.isArray(rows) ? rows : [],
            targetTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询关联目标失败' });
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(implementDelRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ implement }) => implement);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ implement }) => implement);
      const { date } = formData;
      if (Array.isArray(date) && (date[0] || date[1])) {
        [formData.beginDate, formData.endDate] = date;
      }
      const { status, response } = yield call(implementEditRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          const { searchForm } = yield select(({ implement }) => implement);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '操作失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return {};
    },

    *query({ payload }, { call, put }) {
      const { date, ...params } = payload;
      if (Array.isArray(date) && (date[0] || date[1])) {
        [params.beginDate, params.endDate] = date;
      }
      const { status, response } = yield call(implementListRq, params);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },

    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          searchForm: {
            ...defaultSearchForm,
            selectedRowKeys: [],
          },
        },
      });
    },
  },

  reducers: {
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
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
  },
};
