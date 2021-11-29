import {
  finPeriodAllRq,
  finPeriodInsertRq,
  finPeriodUpdateRq,
  finPeriodDetailRq,
  finPeriodByIdDeleteRq,
  finYearAllRq,
} from '@/services/plat/financialPeriod/financialPeriod';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const defaultSearchForm = {};
const defaultFormData = {};

export default {
  namespace: 'financialPeriod',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    dataSource: [],
    formData: {},
    finYearAllData: [],
  },

  effects: {
    *queryFinYearAll({ payload }, { call, put }) {
      const { status, response } = yield call(finYearAllRq, payload);
      if (status === 200) {
        if (response.ok) {
          const { datum } = response;
          yield put({
            type: 'updateState',
            payload: {
              finYearAllData: Array.isArray(datum) ? datum : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询财务年度失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询财务年度失败' });
      }
    },
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(finPeriodAllRq, payload);
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
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ financialPeriod }) => financialPeriod);
      const { periodName } = formData;
      if (periodName) {
        // 财务期间开始日期
        formData.beginDate = moment(periodName)
          .startOf('month')
          .format('YYYY-MM-DD');
        // 财务期间结束日期
        formData.endDate = moment(periodName)
          .endOf('month')
          .format('YYYY-MM-DD');
        // 财务期间
        formData.finPeriod = moment(periodName).month() + 1;
      }

      const { status, response } = yield call(finPeriodInsertRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *update({ payload }, { call, put, select }) {
      const { formData } = yield select(({ financialPeriod }) => financialPeriod);
      const { periodName } = formData;
      if (periodName) {
        // 财务期间开始日期
        formData.beginDate = moment(periodName)
          .startOf('month')
          .format('YYYY-MM-DD');
        // 财务期间结束日期
        formData.endDate = moment(periodName)
          .endOf('month')
          .format('YYYY-MM-DD');
        // 财务期间
        formData.finPeriod = moment(periodName).month() + 1;
      }
      const { status, response } = yield call(finPeriodUpdateRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(finPeriodDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              ...response.datum,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(finPeriodByIdDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ financialPeriod }) => financialPeriod);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
