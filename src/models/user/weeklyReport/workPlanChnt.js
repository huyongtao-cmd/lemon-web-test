import {
  workPlanChntListRq,
  workPlanChntCreateRq,
  workPlanChntDetailsRq,
  workPlanChntDeleteRq,
  workPlanChntUpdateRq,
  workPlanChntFinishRq,
  workPlanChangeStatusRq,
  workPlanChangePointRq,
  taskAllRq,
  activityRq,
  objectiveAllRq,
  getPResInfoRq,
} from '@/services/user/weeklyReport/weeklyReport';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { isNil, isEmpty } from 'ramda';

const defaultSearchForm = {
  relevantResId: [],
  planStatus: 'PLAN',
  dateRange: [],
  developmentStatus: '',
  resultsEvaluation: '',
  emphasisAttention: '',
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
  namespace: 'workPlanChnt',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    dataSource: [],
    resDataSource: [],
    baseBuDataSource: [],
    activityList: [],
    taskAllList: [],
    formData: {},
    objectiveList: [],
    pageConfig: {},
    pointDataSource: [{ id: 1, name: '是' }, { id: 0, name: '否' }],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        dateRange,
        reportedResId,
        relevantResId,
        emphasisAttention,
        completionRange,
        ...params
      } = payload;
      if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
        [params.dateFrom, params.dateTo] = dateRange;
      }
      if (Array.isArray(completionRange) && completionRange[0] && completionRange[1]) {
        [params.completionFrom, params.completionTo] = completionRange;
      }
      if (emphasisAttention) {
        params.emphasisAttention = Number(emphasisAttention);
      }
      params.reportedResId = Array.isArray(reportedResId) ? reportedResId.join(',') : ''; // 汇报对象
      params.relevantResId = Array.isArray(relevantResId) ? relevantResId.join(',') : ''; //  相关人
      const { status, response } = yield call(workPlanChntListRq, params);
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
      const { formData } = yield select(({ workPlanChnt }) => workPlanChnt);
      const { dates, reportedResId, relevantResId, ...params } = formData;
      if (Array.isArray(dates) && dates[0] && dates[1]) {
        [params.dateFrom, params.dateTo] = dates;
      }
      params.reportedResId = reportedResId.join(',');
      params.relevantResId = relevantResId.join(',');
      const { status, response } = yield call(workPlanChntCreateRq, params);
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
      const { formData } = yield select(({ workPlanChnt }) => workPlanChnt);
      const { dates, reportedResId, relevantResId, ...params } = formData;
      if (Array.isArray(dates) && dates[0] && dates[1]) {
        [params.dateFrom, params.dateTo] = dates;
      }
      params.reportedResId = reportedResId.join(',');
      params.relevantResId = relevantResId.join(',');
      const { status, response } = yield call(workPlanChntUpdateRq, params);
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
            reportedResId: response.datum.id ? [response.datum.id] : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取上级领导失败' });
      }
    },
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(workPlanChntDetailsRq, payload);
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
              dateRange: [dateFrom, dateTo].join('~'),
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
      const { status, response } = yield call(workPlanChntDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          const { searchForm } = yield select(({ workPlanChnt }) => workPlanChnt);
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
    *finish({ payload }, { call, put, select }) {
      const { status, response } = yield call(workPlanChntFinishRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '更改成功' });
          const { searchForm } = yield select(({ workPlanChnt }) => workPlanChnt);
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
          createMessage({ type: 'error', description: response.reason || '更改失败' });
        }
      }
    },
    *changePoint({ payload }, { call, put, select }) {
      const { status, response } = yield call(workPlanChangePointRq, payload);
      if (status === 200) {
        if (response && response.ok) {
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
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
        },
      });
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
    *objectiveAll({ payload }, { call, put }) {
      const { response } = yield call(objectiveAllRq);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          objectiveList: list,
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
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
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
