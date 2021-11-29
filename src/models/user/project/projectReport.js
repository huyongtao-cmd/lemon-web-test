import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import {
  getBriefInfo,
  createBriefInfo,
  modifyBriefInfo,
  queryBriefInfoLogicalDetail,
  procStartBriefInfo,
} from '@/services/user/project/project';
import { selectFinperiod } from '@/services/user/Contract/sales';
import { closeThenGoto } from '@/layouts/routerControl';
import { doApprove, doReject } from '@/services/user/expense/flow';
import { getViewConf } from '@/services/gen/flow';

export default {
  namespace: 'projectReport',
  state: {
    mode: 'EDIT',
    formData: {
      reprotCompPercent: 0,
      confirmCompPercent: 0,
      confirmAmt: 0,
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
    finperiodList: [],
    currentFinPeriodId: undefined,
    confirmedAmt: 0,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryBriefInfoLogicalDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
          },
        });
      }
    },
    *queryInfo({ payload }, { call, put, select }) {
      const { status, response } = yield call(getBriefInfo, payload);
      const { formData } = yield select(({ projectReport }) => projectReport);
      if (status === 200) {
        response.confirmedAmt = response.lastPeriodBrief
          ? response.lastPeriodBrief.confirmedAmt + response.lastPeriodBrief.confirmAmt
          : 0;
        if (response.workType === 'T&M') {
          response.reprotCompPercent = 100;
          response.confirmAmt = (response.projAmt * 100) / 100 - response.confirmedAmt;
        }
        response.confirmAmt =
          (response.projAmt * response.reprotCompPercent) / 100 - response.confirmedAmt;
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...formData, ...response },
            mode: payload.mode,
          },
        });
      }
    },
    *queryFinPeriod({ payload }, { call, put }) {
      const { status, response } = yield call(selectFinperiod);
      if (status === 200) {
        const nowString = formatDT(moment()).substring(0, 7);
        let currentFinPeriodId;
        const perildListNow = response.filter(period => period.name === nowString);
        if (!isEmpty(perildListNow)) {
          currentFinPeriodId = perildListNow[0].id;
        }
        yield put({
          type: 'updateState',
          payload: {
            finperiodList: response,
            currentFinPeriodId,
          },
        });
      }
    },
    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        // 修改
        // if (payload.briefStatus !== 'CREATE') {
        //   createMessage({ type: 'warn', description: '只有新增状态的可以修改！' });
        //   return;
        // }
        response = yield call(modifyBriefInfo, payload);
      } else {
        // 新增
        response = yield call(createBriefInfo, payload);
      }
      if (response.response && response.response.ok) {
        // 保存成功
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: { id: response.response.datum.id },
        });
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
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
      let response;
      if (payload.id) {
        // 修改
        // if (payload.briefStatus !== 'CREATE') {
        //   createMessage({ type: 'warn', description: '只有新增状态的可以修改！' });
        //   return;
        // }
        response = yield call(modifyBriefInfo, payload);
      } else {
        // 新增
        response = yield call(createBriefInfo, payload);
      }
      if (response.response && response.response.ok) {
        // 保存成功
        closeThenGoto(`/user/flow/process`);
        /* docId = response.response.datum.id;
        if (payload.apprId) {
          // 再次提交流程
          const result = yield call(doApprove, { taskId: payload.apprId, remark: '' });
          if (result.status === 200) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process`);
          } else if (result.status === 100) {
            // 主动取消请求，不做操作
          } else {
            createMessage({ type: 'error', description: '操作失败' });
          }
        } else {
          // 第一次发起流程
          const result = yield call(procStartBriefInfo, { id: docId });
          if (result.status === 200) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process`);
          } else if (result.status === 100) {
            // 主动取消请求，不做操作
          } else {
            createMessage({ type: 'error', description: '操作失败' });
          }
        } */
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
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
