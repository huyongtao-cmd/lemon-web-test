import {
  queryWeekStart,
  queryLastWeek,
  saveTimesheets,
  deleteTimesheet,
  selectUsers,
  queryProjList,
  queryTasksList,
  revokedTimesheets,
  queryExtrworkFlag,
  // queryActivityList,
} from '@/services/user/timesheet/timesheet';
import { workLogsQuery } from '@/services/user/weeklyReport/weeklyReport';
import { genFakeId } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import update from 'immutability-helper';

export default {
  namespace: 'userTimesheetDetail',

  state: {
    dataSource: [],
    total: 0,
    weekStartDate: null,
    projList: [],
    projTotal: 0,
    userList: [],
    actUdcSource: [],
    taskUdcSource: [],
    taskTagUdc: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      yield put({ type: 'clean' });
      // weekStartDate 必填
      const workDateFrom = moment(payload.weekStartDate)
        .startOf('week')
        .format('YYYY-MM-DD');
      const workDateTo = moment(payload.weekStartDate)
        .endOf('week')
        .format('YYYY-MM-DD');
      // limit: 100 原因：后端默认查询列表数据只查到20条，暂定默认查询100条数据
      // TODO: 当考虑工时数超过100的情况时，工时填报页面各功能需要修改
      const { response } = yield call(queryWeekStart, {
        workDateFrom,
        workDateTo,
        limit: 100,
        sortBy: 'workDate',
        sortDirection: 'ASC',
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
            weekStartDate: workDateFrom,
          },
        });
      }
    },

    *copyLastWeek({ payload }, { call, put }) {
      // weekStartDate、 ids 必填
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
      const { status, response } = yield call(queryLastWeek, {
        weekStartDate: payload.weekStartDate,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({
          type: 'updateInitWeek',
          payload: { ...payload, dataSource: response.rows, lastWeek: true },
        });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
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

    *importWorkLog({ payload }, { call, put }) {
      const result = yield call(workLogsQuery, {
        workDate: payload.weekStartDate,
        workLogPeriodType: 'WEEK',
      });
      console.log(result);
      if (result.status === 100) {
        // 主动取消请求
        return;
      }
      if (result.response && result.response.ok) {
        const resultDataSource = [];
        resultDataSource.push(...payload.dataSource);
        if (result.response.datum) {
          resultDataSource.push(
            ...result.response.datum.map(worlog => ({
              id: genFakeId(-1),
              workHour: 8,
              tsStatus: 'CREATE',
              tsStatusDesc: '填写',
              weekStartDate: payload.weekStartDate,
              workDate: worlog.workDate,
              workDesc: worlog.workDesc,
              projId: 0,
              projName: '无项目',
              tsTaskIden: 'NOTASK',
              tsTaskIdenDesc: '无任务',
              tsActIden: 'ROUTINE',
              tsActIdenDesc: '日常工作',
            }))
          );
        }

        yield put({
          type: 'updateState',
          payload: { dataSource: resultDataSource },
        });
      } else if (result.response.errCode) {
        createMessage({
          type: 'warn',
          description: `操作未成功，原因：${result.response.reason}`,
        });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },

    *save({ payload }, { call, put, select }) {
      const { submitted, dataSource, weekStartDate } = payload;
      const { status, response } = yield call(saveTimesheets, {
        entityList: dataSource,
        delIds: [],
        submitted,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: { weekStartDate } });
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: `操作未成功，原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    *delete({ payload }, { put, call }) {
      const { status, response } = yield call(deleteTimesheet, payload.ids);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        yield put({ type: 'updateState', payload: { dataSource: payload.newDataSource } });
        createMessage({ type: 'success', description: '操作成功' });
      } else if (response.errCode) {
        // NG_DEL_STATUS_ERROR("只能删除状态为创建的工时"),
        createMessage({ type: 'warn', description: `操作未成功，原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 撤回 工时
    *revokedTimesheets({ payload }, { put, call }) {
      const { status, response } = yield call(revokedTimesheets, { ids: payload.ids });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        yield put({ type: 'query', payload: { weekStartDate: payload.weekStartDate } });
        createMessage({ type: 'success', description: '操作成功' });
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: `操作未成功，原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 查询项目列表
    *queryProjList({ payload }, { put, call }) {
      const { response } = yield call(queryProjList, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            projList: Array.isArray(response.rows) ? response.rows : [],
            projTotal: response.total,
          },
        });
      }
    },
    // 根据项目id 查询任务包下拉
    // *selectTask({ payload }, { put, call, select }) {
    //   const { response } = yield call(queryTasksList, { id: payload.projId });
    //   return response
    // },
    // 根据任务包id 查询活动下拉
    // *selectActivity({ payload }, { call, put }) {
    //   const { response } = yield call(queryActivityList, { taskId: payload.taskId });
    //   return response
    // },
    *checkedProject({ payload }, { put, call, select }) {
      const { rowIndex, checkedKeys, checkRows } = payload;
      const projId = checkedKeys[0]; // 项目id
      const { projName } = checkRows[0]; // 项目名称
      const { dataSource } = yield select(({ userTimesheetDetail }) => userTimesheetDetail);
      const newDataSource = dataSource;
      const newRow = {
        ...newDataSource[rowIndex],
        projId,
        projName,
        taskId: null,
        tsTaskIden: null,
        actId: null,
        tsActIden: null,
        timesheetViews: [],
      };
      newDataSource[rowIndex] = newRow;
      // 根据项目id 查询任务包下拉
      const { status, response } = yield call(queryTasksList, { id: projId });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        newDataSource[rowIndex] = { ...newRow, taskId: null, timesheetViews: response.datum };
        // createMessage({ type: 'success', description: '操作成功' });
      } else if (response.reason) {
        createMessage({ type: 'warn', description: `${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '操作失败,请联系管理员' });
      }
      yield put({
        type: 'updateState',
        payload: {
          dataSource: newDataSource,
        },
      });
      return {
        workDate: newDataSource[rowIndex].workDate,
        projId: newDataSource[rowIndex].projId,
        rowIndex,
      };
    },
    *selectUsers(_, { call, put }) {
      const response = yield call(selectUsers);
      if (response) {
        yield put({
          type: 'updateState',
          payload: { userList: Array.isArray(response.response) ? response.response : [] },
        });
      }
    },
    *flag({ payload }, { call, put, select }) {
      const { workDate, projId, rowIndex } = payload;
      const { response } = yield call(queryExtrworkFlag, { workDate, projId });
      const { dataSource } = yield select(({ userTimesheetDetail }) => userTimesheetDetail);
      if (response.ok) {
        const {
          datum: { workFlag, workRelId },
        } = response;
        const newDataSource = dataSource;
        newDataSource[rowIndex] = {
          ...newDataSource[rowIndex],
          workFlag,
          workRelId,
        };
        yield put({
          type: 'updateState',
          payload: {
            dataSource: newDataSource,
          },
        });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          dataSource: [],
          total: 0,
          weekStartDate: null,
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
    updateInitWeek(state, action) {
      const {
        payload: { dataSource, lastWeek = false },
      } = action;
      const { weekStartDate } = state;
      const newDataSource = dataSource.map((item, i) => ({
        ...item,
        id: genFakeId(-1),
        tsStatus: 'CREATE',
        tsStatusDesc: '填写',
        weekStartDate,
        workDate: lastWeek
          ? moment(item.workDate)
              .add(7, 'days')
              .format('YYYY-MM-DD')
          : moment(weekStartDate)
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
