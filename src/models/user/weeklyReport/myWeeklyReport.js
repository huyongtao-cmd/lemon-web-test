import {
  weeklyReportDetailRq,
  myWeeklyReportListRq,
} from '@/services/user/weeklyReport/weeklyReport';
import createMessage from '@/components/core/AlertMessage';
import { isNil, isEmpty, clone } from 'ramda';
import { genFakeId } from '@/utils/mathUtils';

const defaultSearchForm = {
  reportedResId: [],
};

export default {
  namespace: 'myWeeklyReport',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: {},
    workPlanList: [],
    taskAllList: [],
    thisWeek: {},
    thisWeekList: [],
    nextWeek: {},
    nextWeekList: [],
    timesheetsList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(myWeeklyReportListRq, payload);
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
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(weeklyReportDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { nextWeek, thisWeek, reportedResId } = response.datum;

          const nextWeekList = Array.isArray(nextWeek.details) ? nextWeek.details : [];
          const newNextWeek = [];
          nextWeekList.forEach(v => {
            newNextWeek.push(v);
            const t = clone(v);
            // eslint-disable-next-line
            t.id = genFakeId(-1);
            newNextWeek.push(t);
          });

          const thisWeekList = Array.isArray(thisWeek.details) ? thisWeek.details : [];
          const newThisWeek = [];
          thisWeekList.forEach(v => {
            newThisWeek.push(v);
            const t = clone(v);
            // eslint-disable-next-line
            t.id = genFakeId(-1);
            newThisWeek.push(t);
          });

          yield put({
            type: 'updateState',
            payload: {
              nextWeek: !isNil(nextWeek) && !isEmpty(nextWeek) ? nextWeek : [],
              nextWeekList,
              thisWeek: !isNil(thisWeek) && !isEmpty(thisWeek) ? thisWeek : [],
              thisWeekList: newThisWeek,
              formData: response.datum,
            },
          });
          yield put({
            type: 'updateForm',
            payload: {
              thisWeekStartDate: thisWeek.weekStartDate,
              nextWeekStartDate: nextWeek.weekStartDate,
              reportedResName: thisWeek.reportedResName,
              reportResName: thisWeek.reportResName,
              reportDate: thisWeek.reportDate,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        }
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          list: [],
          total: 0,
        },
      });
    },
    *cleanView(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultSearchForm,
          thisWeek: {},
          thisWeekList: [],
          nextWeek: {},
          nextWeekList: [],
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
