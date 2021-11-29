import {
  workPlanListRq,
  taskAllRq,
  activityRq,
  workReportCreateRq,
  workReportFindByDateRq,
  getWorkPlanRq,
  getPResInfoRq,
} from '@/services/user/weeklyReport/weeklyReport';
import { queryTimeSheets } from '@/services/user/timesheet/timesheet';
import { queryUserPrincipal } from '@/services/gen/user';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import createMessage from '@/components/core/AlertMessage';
import { isNil, isEmpty } from 'ramda';
import moment from 'moment';
import { genFakeId } from '@/utils/mathUtils';

const defaultFormData = {
  reportedResId: [],
};

export default {
  namespace: 'makeWeeklyReport',
  state: {
    formData: defaultFormData,
    resDataSource: [],
    dataSource: [],
    workPlanList: [],
    taskAllList: [],
    thisWeek: {},
    thisWeekList: [],
    thisWeekDelList: [],
    nextWeek: {},
    nextWeekList: [],
    nextWeekDelList: [],
    timesheetsList: [],
  },

  effects: {
    *submit({ payload }, { call, put, select }) {
      const {
        formData,
        thisWeek,
        thisWeekList,
        thisWeekDelList,
        nextWeek,
        nextWeekList,
        nextWeekDelList,
      } = yield select(({ makeWeeklyReport }) => makeWeeklyReport);

      const { reportedResId, ...params } = formData;

      params.reportedResId = reportedResId.join(',');

      thisWeek.details = thisWeekList;
      thisWeek.delList = thisWeekDelList;
      thisWeek.reportedResId = formData.reportedResId.join(',');
      params.thisWeek = thisWeek;

      nextWeek.details = nextWeekList;
      nextWeek.delList = nextWeekDelList;
      // nextWeek.reportedResId = formData.reportedResId.join(',');
      params.nextWeek = nextWeek;

      const { status, response } = yield call(workReportCreateRq, { ...params, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },
    *getWorkReport({ payload }, { call, put, select }) {
      const { status, response } = yield call(getWorkPlanRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { thisWeekList } = yield select(({ makeWeeklyReport }) => makeWeeklyReport);
        const {
          user: {
            extInfo: { resId },
          },
        } = yield select(({ user }) => user);
        response.datum.filter(v => v.planResId === resId).forEach(item => {
          const tt = thisWeekList.filter(v => v.planId === item.id);
          if (tt.length <= 0) {
            thisWeekList.push({ planId: item.id, ...item, id: genFakeId(-1) });
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            thisWeekList,
          },
        });
        createMessage({ type: 'success', description: '导入成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '导入失败' });
      }
    },
    *getWorkPlan({ payload }, { call, put, select }) {
      const { status, response } = yield call(getWorkPlanRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { nextWeekList, formData } = yield select(({ makeWeeklyReport }) => makeWeeklyReport);
        response.datum.forEach(item => {
          const tt = nextWeekList.filter(v => v.planId === item.id);
          if (tt.length <= 0) {
            const startNum = moment(item.dateFrom).diff(moment(formData.nextWeekStartDate), 'days'); // 从哪一天开始
            const daysNum = moment(item.dateTo).diff(moment(item.dateFrom), 'days'); // 起始日和结束日相差多少天
            const dayCheck = {};
            for (let i = 0; i < daysNum; i += 1) {
              dayCheck[`planFlag${startNum + 1 + i}1`] = 1;
              dayCheck[`planFlag${startNum + 1 + i}2`] = 1;
              dayCheck[`planFlag${startNum + 1 + i}3`] = 0;
            }
            nextWeekList.push({ planId: item.id, ...dayCheck, ...item, id: genFakeId(-1) });
          }
        });
        createMessage({ type: 'success', description: '导入成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '导入失败' });
      }
    },
    *getPResInfo({ payload }, { call, put, select }) {
      const { status, response } = yield call(getPResInfoRq, payload);
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        if (!isNil(response.datum)) {
          yield put({
            type: 'updateForm',
            payload: {
              reportedResId: [response.datum.id],
            },
          });
          return [response.datum.id];
        }
        return [];
      }
      createMessage({ type: 'error', description: response.reason || '获取上级领导失败' });
      return [];
    },
    *queryTimeSheetsList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryTimeSheets, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            timesheetsList: Array.isArray(rows) ? rows : [],
          },
        });

        // 将工时数据回填到周报中
        const {
          thisWeekList,
          timesheetsList,
          formData: { weekStartDate },
        } = yield select(({ makeWeeklyReport }) => makeWeeklyReport);

        if (isNil(timesheetsList) || isEmpty(timesheetsList)) {
          createMessage({ type: 'warn', description: '暂无可导入工时' });
          return;
        }

        thisWeekList.forEach(row => {
          // 与工时数据的taskid和activityId匹配，再根据日期回填对应的日期数据
          const tt = timesheetsList.filter(
            v => v.actId === row.activityId && v.taskId === row.taskId
          );
          if (tt.length) {
            tt.forEach(v => {
              const daysDiff = moment(v.workDate).diff(moment(weekStartDate), 'days');
              const workKey = 'workDesc' + daysDiff;
              // eslint-disable-next-line
              row[workKey] = v.workDesc;
            });
          }
        });
        createMessage({ type: 'success', description: '导入成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '导入失败' });
      }
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(workReportFindByDateRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const { nextWeek, thisWeek } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              nextWeek: !isNil(nextWeek) && !isEmpty(nextWeek) ? nextWeek : [],
              nextWeekList: Array.isArray(nextWeek.details) ? nextWeek.details : [],
              thisWeek: !isNil(thisWeek) && !isEmpty(thisWeek) ? thisWeek : [],
              thisWeekList: Array.isArray(thisWeek.details) ? thisWeek.details : [],
              formData: response.datum,
            },
          });
          yield put({
            type: 'updateForm',
            payload: {
              thisWeekStartDate: thisWeek.weekStartDate,
              nextWeekStartDate: nextWeek.weekStartDate,
              reportedResId:
                !isNil(thisWeek.reportedResId) && !isEmpty(thisWeek.reportedResId)
                  ? thisWeek.reportedResId.split(',').map(v => Number(v))
                  : [],
            },
          });
          // 如果汇报人为空
          if (isNil(thisWeek.reportedResId) || isEmpty(thisWeek.reportedResId)) {
            yield put({
              type: 'getPResInfo',
            });
          }
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '查询失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '查询失败' });
      return {};
    },
    *queryWorkPlanList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { resId } = response.extInfo || {};
        const { status: sts, response: res } = yield call(workPlanListRq, {
          planResId: resId,
          limit: 0,
          ...payload,
        });
        if (sts === 100) {
          // 主动取消请求
          return;
        }
        if (sts === 200) {
          const { rows } = res;
          if (Array.isArray(rows)) {
            rows.forEach(v => {
              if (isNil(v.planNo) || isEmpty(v.planNo)) {
                // eslint-disable-next-line
                v.planNo = '无编号';
              }
            });
            yield put({
              type: 'updateState',
              payload: {
                workPlanList: rows,
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                workPlanList: [],
              },
            });
          }
        } else {
          createMessage({ type: 'error', description: response.reason || '查询工作计划失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取当前录人信息失败' });
      }
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
      const { status, response } = yield call(activityRq, payload);
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        const list = Array.isArray(response.datum) ? response.datum : [];
        return list;
      }
      createMessage({ type: 'error', description: response.reason || '获取任务相关活动失败' });
      return [];
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

    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: { formData: defaultFormData },
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
