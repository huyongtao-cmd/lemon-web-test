import { deleteTimesheet } from '@/services/user/timesheet/timesheet';
import {
  saveWorkLog,
  queryStartTime,
  workPlanSelect,
  workReportSave,
  reportUpdataUrl,
  getPResInfoRq,
} from '@/services/user/weeklyReport/weeklyReport';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { genFakeId } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import update from 'immutability-helper';

export default {
  namespace: 'workLog',

  state: {
    unsavedFlag: false,
    dataSource: [],
    total: 0,
    delIds: [],
    workReportLog: {
      workDate: undefined,
      workLogPeriodType: undefined,
      workReportLogList: [],
      reportToResId: [],
    },
    workDate: undefined,
    taskAllList: [],
    taskAllListJson: {},
    workLogPeriodType: 'WEEK',
    workReportPageConfig: {},
    // reportedResId: [],
  },

  effects: {
    *query({ payload }, { select, call, put }) {
      // weekStartDate 必填
      const { workLogPeriodType, workDate } = yield select(({ workLog }) => workLog);
      const { response } = yield call(queryStartTime, {
        workDate,
        workLogPeriodType,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.datum) ? response.datum : [],
            total: response.total,
            unsavedFlag: false,
          },
        });
      }
    },

    *workPlan({ payload }, { call, put }) {
      const { status, response } = yield call(workPlanSelect, {});
      const list = Array.isArray(response) ? response : [];
      const taskAllListJson = {};
      list.forEach(element => {
        taskAllListJson[element.id] = element.valDesc;
      });
      yield put({
        type: 'updateState',
        payload: {
          taskAllList: list,
          taskAllListJson,
        },
      });
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        // const list = Array.isArray(response.datum) ? response.datum : [];
        // return list;
      } else {
        createMessage({ type: 'error', description: response.reason || '获取工作计划失败' });
        return [];
      }
      return [];
    },

    *initWeek({ payload }, { call, put }) {
      // dataSource、ids 必填
      if (payload.ids && payload.ids.length) {
        const result = yield call(deleteTimesheet, payload.ids);
        if (result.status === 100) {
          // 主动取消请求
          return;
        }
        if (result.response && result.response.ok) {
          //
        } else if (result.response.errCode) {
          createMessage({
            type: 'warn',
            description: `操作未成功，原因：${result.response.reason}`,
          });
          return;
        } else {
          createMessage({ type: 'error', description: '操作失败' });
          return;
        }
      }
      yield put({
        type: 'updateInitWeek',
        payload: { dataSource: payload.dataSource },
      });
    },
    *save({ payload }, { call, put, select }) {
      const { submitted, dataSource } = payload;
      const { delIds } = yield select(({ workLog }) => workLog);

      const { status, response } = yield call(saveWorkLog, {
        dataSource,
        delIds,
        // submitted,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      yield put({
        type: 'query',
        payload: {},
      });
      if (response.errCode) {
        createMessage({ type: 'warn', description: `操作未成功，原因：${response.reason}` });
      } else {
        // createMessage({ type: 'success', description: '操作成功' });
      }
    },

    *delete({ payload }, { put, call }) {
      // const { status, response } = yield call(deleteTimesheet, payload.ids);
      yield put({
        type: 'updateState',
        payload: { dataSource: payload.newDataSource, delIds: payload.ids },
      });
    },

    // 弹窗保存和汇报
    *modalSaveReport({ payload }, { put, call }) {
      const param = payload;
      param.reportToResId = param.reportToResId ? param.reportToResId.join(',') : null;
      const { response } = yield call(workReportSave, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
      } else if (response.errCode) {
        createMessage({
          type: 'warn',
          description: `操作未成功，原因：${response.reason}`,
        });
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('操作失败');
      } else {
        createMessage({ type: 'error', description: '操作失败' });
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('操作失败');
      }

      yield put({
        type: 'cleanReportModal',
        payload: {},
      });
      return Promise.resolve(true);
    },

    *getWorkReportPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            workReportPageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
    },

    *getPResInfo({ payload }, { call, put, select }) {
      const { status, response } = yield call(getPResInfoRq, payload);
      if (status === 200 && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            // reportedResId: response.datum.id ? [response.datum.id] : [],
            workReportLog: {
              workDate: undefined,
              workLogPeriodType: undefined,
              workReportLogList: [],
              reportToResId: response.datum.id ? [response.datum.id] : [], // 初始化获取的上级id
            },
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取上级领导失败' });
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
    clean(state, action) {
      return {
        ...state,
        dataSource: [],
        total: 0,
        workDate: null,
        delIds: [],
      };
    },
    cleanReportModal(state, action) {
      return {
        ...state,
        workReportLog: {
          workReportLogList: [],
        },
      };
    },
    updateReportModal(state, action) {
      return {
        ...state,
        workReportLog: { ...state.workReportLog, ...action.payload },
      };
    },
    updateInitWeek(state, action) {
      const {
        payload: { dataSource, lastWeek = false },
      } = action;
      const { workDate, workLogPeriodType } = state;
      const newDataSource = dataSource.map((item, i) => ({
        ...item,
        id: genFakeId(-1),
        tsStatus: 'CREATE',
        tsStatusDesc: '填写',
        workDate: lastWeek
          ? moment(item.workDate)
              .add(7, 'days')
              .format('YYYY-MM-DD')
          : moment(workDate)
              .add(i, 'days')
              .format('YYYY-MM-DD'),
        projId: '' + item.projId ? item.projId : null,
        actId: item.actId ? item.actId : null,
        taskId: item.taskId ? item.taskId : null,
        workHour: item.workHour ? item.workHour : 8,
        workDesc: null,
        tsActIden: item.tsActIden ? item.tsActIden : null,
        tsTaskIden: item.tsTaskIden ? item.tsTaskIden : null,
        timesheetViews: item.timesheetViews ? item.timesheetViews : [],
      }));
      return {
        ...state,
        dataSource: newDataSource,
      };
    },
  },
};
