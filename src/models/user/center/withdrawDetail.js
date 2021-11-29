import { queryWithdrawDetail, modifyWithdraw } from '@/services/user/equivalent/equivalent';
import { findByCondition } from '@/services/org/bu/component/buEqva';
import { getViewConf } from '@/services/gen/flow';
import { queryTimeSheets } from '@/services/user/timesheet/timesheet';
import { selectWorkHoursByDate } from '@/services/sys/baseinfo/vacation';

import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';

export default {
  namespace: 'withdrawDetail',
  state: {
    formData: {},
    dataSource: [],
    timeSheetSource: [],
    timeSheetTotal: 0,
    salarySource: [],
    salaryTotal: 0,

    workHours: 0,
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryWithdrawDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            dataSource: response.dtlViews,
          },
        });
      }
    },

    *queryTimeSheet({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        tsResId: payload && payload.tsResId ? payload.tsResId : undefined,
        dateRange: undefined,
        workDateFrom: payload && payload.dateRange ? formatDT(payload.dateRange[0]) : undefined,
        workDateTo: payload && payload.dateRange ? formatDT(payload.dateRange[1]) : undefined,
      };
      const { response } = yield call(queryTimeSheets, newPayload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            timeSheetSource: Array.isArray(response.rows) ? response.rows : [],
            timeSheetTotal: response.total,
          },
        });
      }
    },

    *queryWorkHours({ payload }, { call, put }) {
      const { response } = yield call(selectWorkHoursByDate, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            workHours: response || 0,
          },
        });
      }
    },

    *queryEqvaSalary({ payload }, { call, put }) {
      const { response } = yield call(findByCondition, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            salarySource: Array.isArray(response.rows) ? response.rows : [],
            salaryTotal: response.total,
          },
        });
      }
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },

    *submit({ payload }, { call, put }) {
      const response = yield call(modifyWithdraw, payload);
      if (response.response && response.response.ok) {
        // 保存成功
        closeThenGoto(`/user/flow/process`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
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

    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
