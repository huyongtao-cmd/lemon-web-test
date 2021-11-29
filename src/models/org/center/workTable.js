import createMessage from '@/components/core/AlertMessage';
import {
  getOkrListFn,
  getWorkPlanListFn,
  getReportListFn,
  getExamListFn,
  getBuMemberFn,
} from '@/services/org/bu/center';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'orgCenterWorkTable',
  state: {},

  effects: {
    *queryOkrList({ payload }, { call, put }) {
      const { status, response } = yield call(getOkrListFn, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            okrList: Array.isArray(rows) ? rows : [],
            okrTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *queryWorkPlanList({ payload }, { call, put }) {
      const { status, response } = yield call(getWorkPlanListFn, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            workPlanList: Array.isArray(rows) ? rows : [],
            workPlanTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *queryReportList({ payload }, { call, put }) {
      const { status, response } = yield call(getReportListFn, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            reportList: Array.isArray(rows) ? rows : [],
            reportTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *queryExamListList({ payload }, { call, put }) {
      const { status, response } = yield call(getExamListFn, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            examtList: Array.isArray(rows) ? rows : [],
            examTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, { pageNo: payload.pageNo });
      const { type } = payload;
      if (status === 200) {
        if (type === 'kr') {
          yield put({
            type: 'updateState',
            payload: {
              krPageConfig: response.configInfo,
            },
          });
        }
        if (type === 'exam') {
          yield put({
            type: 'updateState',
            payload: {
              examPageConfig: response.configInfo,
            },
          });
        }

        return response;
      }
      return {};
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          okrList: [],
          okrTotal: 0,
          workPlanList: [],
          workPlanTotal: 0,
          reportList: [],
          reportTotal: 0,
          examtList: [],
          examTotal: 0,
        },
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
  },
};
