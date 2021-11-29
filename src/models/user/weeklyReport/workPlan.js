import {
  workPlanListRq,
  workPlanCreateRq,
  workPlanDetailsRq,
  workPlanUpdateRq,
  workPlanDeleteRq,
  workPlanChangeStatusRq,
  taskAllRq,
  activityRq,
  getPResInfoRq,
} from '@/services/user/weeklyReport/weeklyReport';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { isNil, isEmpty } from 'ramda';

const defaultSearchForm = {
  reportedResId: [],
  relevantResId: [],
  planStatus: 'PLAN',
};
const defaultFormData = {
  planStatus: 'PLAN',
  planType: 'WORK',
  planTypeDisabled: 1,
  taskNameDisabled: 1,
  reportedResId: [],
  relevantResId: [],
};

export default {
  namespace: 'workPlan',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    dataSource: [],
    resDataSource: [],
    activityList: [],
    taskAllList: [],
    formData: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { createTime, reportedResId, relevantResId, ...params } = payload;
      if (Array.isArray(createTime) && createTime[0] && createTime[1]) {
        [params.createTimeStart, params.createTimeEnd] = createTime;
      }
      params.reportedResId = reportedResId.join(',');
      params.relevantResId = relevantResId.join(',');

      const { status, response } = yield call(workPlanListRq, params);
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
    *save({ payload }, { call, put, select }) {
      const { formData } = yield select(({ workPlan }) => workPlan);
      const { dates, reportedResId, relevantResId, ...params } = formData;
      if (Array.isArray(dates) && dates[0] && dates[1]) {
        [params.dateFrom, params.dateTo] = dates;
      }
      params.reportedResId = reportedResId.join(',');
      params.relevantResId = relevantResId.join(',');

      const { status, response } = yield call(workPlanCreateRq, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *edit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ workPlan }) => workPlan);
      const { dates, reportedResId, relevantResId, ...params } = formData;
      if (Array.isArray(dates) && dates[0] && dates[1]) {
        [params.dateFrom, params.dateTo] = dates;
      }
      params.reportedResId = reportedResId.join(',');
      params.relevantResId = relevantResId.join(',');

      const { status, response } = yield call(workPlanUpdateRq, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *getPResInfo({ payload }, { call, put, select }) {
      const { status, response } = yield call(getPResInfoRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        yield put({
          type: 'updateForm',
          payload: {
            reportedResId: [response.datum.id],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取上级领导失败' });
      }
    },
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(workPlanDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          // 做了一个简单的优化:解决当 response.datum 为 null 时的报错
          const {
            dateFrom = '',
            dateTo = '',
            reportedResId = [],
            relevantResId = [],
          } = response.datum;
          yield put({
            type: 'updateForm',
            payload: {
              ...defaultFormData,
              ...response.datum,
              dates: [dateFrom, dateTo],
              reportedResId:
                !isNil(reportedResId) && !isEmpty(reportedResId)
                  ? reportedResId.split(',').map(v => Number(v))
                  : [],
              relevantResId:
                !isNil(relevantResId) && !isEmpty(relevantResId)
                  ? relevantResId.split(',').map(v => Number(v))
                  : [],
            },
          });
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(workPlanDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          const { searchForm } = yield select(({ workPlan }) => workPlan);
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
    *ChangeStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(workPlanChangeStatusRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          // const { searchForm } = yield select(({ workPlan }) => workPlan);
          // yield put({
          //   type: 'query',
          //   payload: searchForm,
          // });
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      console.log('这是？？？？', list);
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
        },
      });
    },
    *taskAll({ payload }, { call, put }) {
      const { response } = yield call(taskAllRq, payload);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          taskAllList: list,
        },
      });
    },
    *activity({ payload }, { call, put }) {
      const { response } = yield call(activityRq, payload);
      const list = Array.isArray(response.datum) ? response.datum : [];
      yield put({
        type: 'updateState',
        payload: {
          activityList: list,
        },
      });
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          activityList: [],
        },
      });
    },
    *cleanTableFrom(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          list: [],
          total: 0,
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
