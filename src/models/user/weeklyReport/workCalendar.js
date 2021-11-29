import {
  workCalendarInfo,
  updateWorkStatusApi,
  workPlanDeleteRq,
} from '@/services/user/weeklyReport/weeklyReport';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';

const defaultStartDate = moment().startOf('isoWeek');
const defaultEndDate = moment()
  .add(4, 'w')
  .startOf('isoWeek');
// 周计划分解为天计划
const weekPlanResolve = (plan, planStartDate, planEndDate) => {
  const newPlanStartDate = planStartDate;
  const newPlanEndDate = planEndDate;
  const { yearWeek, planViews, leavePlanView } = plan;
  const itemYear = parseInt(yearWeek.substr(0, 4), 10);
  const itemWeek = parseInt(yearWeek.substr(4, 2), 10);
  return Array(7)
    .fill({})
    .map((day, idx) => {
      const result = {};
      const currDay = moment()
        .year(itemYear)
        .isoWeek(itemWeek)
        .isoWeekday(idx + 1); // 一周的第一天是周日；应该可以有方法设置 第一天是周一；
      // .add(idx + 1, 'days');
      result.date = currDay.format('MM/DD');
      result.yearDate = currDay.format('YYYY-MM-DD');
      // 把每周计划放到每天的计划里
      result.dayPlanInfo = planViews.map((pItem, pIdx) => {
        const dayPlanInfoItem = {};
        const dayInPlan = moment(currDay).isBetween(pItem.dateFrom, pItem.dateTo, 'day');
        const dayInPlanStart = moment(currDay).format('YYYY-MM-DD') === pItem.dateFrom;
        const dayInPlanEnd = moment(currDay).format('YYYY-MM-DD') === pItem.dateTo;

        if (dayInPlan || dayInPlanStart || dayInPlanEnd) {
          dayPlanInfoItem.id = pItem.id;
          dayPlanInfoItem.planName = pItem.taskName;
          dayPlanInfoItem.planStatus = pItem.planStatus;
          dayPlanInfoItem.planType = pItem.planType;
          // 休假处理 休假名字叫做休假 是否结束 根据当前时间是否超过了休假结束的时间
          if (dayPlanInfoItem.planType === 'VACATION') {
            dayPlanInfoItem.planName = '休假计划';
          }
          if (dayPlanInfoItem.planType === 'VACATION') {
            const vacationEnd = moment().isAfter(pItem.dateTo);
            const vacationlastDay = moment().format('YYYY-MM-DD') === pItem.dateTo;
            if (vacationEnd && !vacationlastDay) {
              dayPlanInfoItem.planStatus = 'FINISHED';
            } else {
              dayPlanInfoItem.planStatus = 'PLAN';
            }
          }
          if (dayPlanInfoItem.planStatus) {
            if (dayPlanInfoItem.planStatus === 'PLAN') {
              if (dayPlanInfoItem.planType === 'WORK') {
                dayPlanInfoItem.className = 'plan-color';
              } else {
                dayPlanInfoItem.className = 'vacation-color';
              }
            } else {
              dayPlanInfoItem.className = 'finish-color';
            }
          }

          if (dayPlanInfoItem.planType) {
            if (dayPlanInfoItem.planType === 'WORK') {
              dayPlanInfoItem.planNo = pItem.planNo;
              dayPlanInfoItem.remark1 = pItem.remark1;
              dayPlanInfoItem.remark2 = pItem.remark2;
            }
          }
        }
        // 是否大于本周周一
        // 周一 和 周日
        const mon = moment()
          .year(itemYear)
          .isoWeek(itemWeek)
          .isoWeekday(1)
          .format('YYYY-MM-DD');
        const sun = moment()
          .year(itemYear)
          .isoWeek(itemWeek)
          .isoWeekday(7)
          .format('YYYY-MM-DD');
        const startBeforeWeek = moment(pItem.dateFrom).isBefore(mon);
        const endAfterWeek = moment(pItem.dateTo).isAfter(sun);
        const startBeforeRange = moment(pItem.dateFrom).isBefore(newPlanStartDate);
        const endAfterRange = moment(pItem.dateTo).isAfter(newPlanEndDate);
        // 如果在周一之前开始那么周一就是开始的一天
        // 如果在周日之后结束那么周日就是最后一天
        // 周日之后但是范围内也不是结束day
        if (
          (startBeforeWeek && moment(currDay).isoWeekday() === 1) ||
          (dayInPlanStart && moment(currDay).isoWeekday() === 1)
        ) {
          dayPlanInfoItem.needName = true;
        }
        if (
          (startBeforeRange && moment(currDay).format('YYYY-MM-DD') === newPlanStartDate) ||
          (!startBeforeRange && moment(currDay).format('YYYY-MM-DD') === pItem.dateFrom)
        ) {
          dayPlanInfoItem.isStart = true;
        }

        if (
          (endAfterRange && moment(currDay).format('YYYY-MM-DD') === newPlanEndDate) ||
          (!endAfterRange && moment(currDay).format('YYYY-MM-DD') === pItem.dateTo)
        ) {
          dayPlanInfoItem.isEnd = true;
        }

        return dayPlanInfoItem;
      });
      // 把本周的休假计划放到每天里
      result.leavePlanInfo = leavePlanView
        .map((pItem, pIdx) => {
          const leavePlanInfoItem = {};
          if (moment(currDay).format('YYYY-MM-DD') === pItem.vdate) {
            const vacationEnd = moment().isAfter(pItem.vdate);
            const vacationlastDay = moment().format('YYYY-MM-DD') === pItem.vdate;
            if (vacationEnd && !vacationlastDay) {
              leavePlanInfoItem.className = 'finish-color';
            } else {
              leavePlanInfoItem.className = 'vacation-color';
            }
            leavePlanInfoItem.vdays = pItem.vdays;
          }
          return leavePlanInfoItem;
        })
        .filter(value => Object.keys(value).length !== 0);
      return result;
    });
};

// 计划任务 重组数据结构
const calendarPlanResolve = plans => {
  const { workingCalendarPlan, planStartDate, planEndDate } = plans;
  const newPlans = Object.assign([], workingCalendarPlan);
  newPlans.forEach(plan => {
    // eslint-disable-next-line no-param-reassign
    plan.dayPlan = weekPlanResolve(plan, planStartDate, planEndDate);
  });
  return newPlans;
};
export default {
  namespace: 'workCalendar',
  state: {
    workStatus: '',
    workCalendarData: {},
    cleanWorkCalender: [],
    weekStartDate: defaultStartDate, // 开始日期选择周一
    weekEndDate: defaultEndDate, // 结束日期选择周一开始日期往后推4周
    planStartDate: moment()
      .startOf('isoWeek')
      .format('YYYY-MM-DD'), // 开始周的周一
    planEndDate: moment(defaultEndDate)
      .endOf('isoWeek')
      .format('YYYY-MM-DD'), // 结束周的周日
    cellSelectedBox: [], // 选中的单元格
    resId: '',
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const queryParams = payload;
      if (!queryParams.resId) {
        delete queryParams.resId;
      }
      const { status, response } = yield call(workCalendarInfo, queryParams);
      const { planStartDate, planEndDate } = yield select(({ workCalendar }) => workCalendar);
      if (status === 200 && response.ok) {
        const workCalendarData =
          !isNil(response.datum) && !isEmpty(response.datum) ? response.datum : {};
        const workingCalendarPlan = workCalendarData.workingCalendarPlan
          ? workCalendarData.workingCalendarPlan
          : [];
        const { resId } = workCalendarData;
        const params = {
          workingCalendarPlan,
          planEndDate,
          planStartDate,
        };
        const cleanWorkCalender = yield call(calendarPlanResolve, params);
        const workStatus = workCalendarData.workStatus ? workCalendarData.workStatus : '';
        yield put({
          type: 'updateState',
          payload: {
            cleanWorkCalender,
            workCalendarData,
            workStatus,
            resId,
          },
        });
      }
    },
    *updateWorkStatus({ payload }, { call, put }) {
      const { status, response } = yield call(updateWorkStatusApi, payload);
      const { workStatus } = payload;
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '工作状态更新成功' });
        yield put({
          type: 'updateState',
          payload: {
            workStatus,
          },
        });
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { planStartDate, planEndDate } = yield select(({ workCalendar }) => workCalendar);
      const { status, response } = yield call(workPlanDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          yield put({
            type: 'query',
            payload: {
              planStartDate,
              planEndDate,
            },
          });
        } else {
          const message = response.reason || '删除失败';
          createMessage({ type: 'error', description: message });
        }
      }
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
