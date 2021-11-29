import moment from 'moment';
import {
  getInfo,
  getSumTable,
  createEquivalent,
  saveCheckEqva,
  checkTaskEqva,
  closeTaskByStlId,
  checkLastEquivalent,
} from '@/services/user/equivalent/equivalent';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';

const defaultFlowForm = {
  remark: undefined,
  salesmanResId: {},
  dirty: false,
};

export default {
  namespace: 'SumPreview',
  state: {
    formData: {},
    list: [],
    total: undefined,
    fieldsConfig: {},
    flowForm: defaultFlowForm,
  },
  effects: {
    *queryInfo({ payload }, { call, put, all }) {
      const { formRes, tableRes } = yield all({
        formRes: call(getInfo, { id: payload }),
        tableRes: call(getSumTable, { id: payload }),
      });
      if (formRes.status === 200 && tableRes.status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: formRes.response.datum,
            list: Array.isArray(tableRes.response.datum) ? tableRes.response.datum : [],
            total: tableRes.response.total,
          },
        });
      }
    },
    *fetchConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: defaultFlowForm,
          },
        });
        const { taskKey } = response || {};
        // 需要判断是否第一次进入审批中的页面
        const { formData, list } = yield select(({ SumPreview }) => SumPreview);
        if (
          taskKey &&
          taskKey === 'ACC_A22_02_EMPLOYER_CONFIRM_b' &&
          formData.apprStatus === 'APPROVING'
        ) {
          // 进入审批界面默认 调整完工百分比=本次填报完工百分比 实际结算当量=本次申请结算当量
          const newList = list.length
            ? list.map(item => ({
                ...item,
                approveCompPercent: item.reportCompPercent,
                approveSettleEqva: item.applySettleEqva,
              }))
            : [];
          yield put({
            type: 'updateState',
            payload: { list: newList },
          });
        }
      }
    },
    *saveData({ payload }, { call }) {
      const { status, response } = yield call(createEquivalent, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        return true;
      }
      if (status === 100) {
        // 主动取消请求，不做操作
        return false;
      }
      createMessage({ type: 'error', description: '保存失败' });
      return false;
    },

    // eslint-disable-next-line consistent-return
    *checkAndSave({ payload }, { call }) {
      const settleDate = payload.settleDate && moment(payload.settleDate).format('YYYY-MM-DD');

      const res = yield call(checkLastEquivalent, settleDate);
      if (res.status === 200 && res.response.ok) {
        if (res.response.datum.canSettlement) {
          const { status, response } = yield call(saveCheckEqva, {
            procTaskId: payload.procTaskId,
            ...payload,
          });
          if (status === 200 && response.ok) {
            createMessage({ type: 'success', description: '审批成功' });
            return true;
          }
          if (status === 100) {
            // 主动取消请求，不做操作
            return false;
          }
          createMessage({ type: 'error', description: response.reason });
          return false;
        }
        createMessage({
          type: 'warn',
          description: `结算日期已冻结至${
            res.response.datum.lastSettlementDate
          }，请选择此日期之后的时间进行结算`,
        });
      }
    },
    *checkTaskEqva({ payload }, { call }) {
      const { status, response } = yield call(checkTaskEqva, payload);
      if (status === 100) {
        return false;
      }
      if (status === 200 && response.ok && response.datum) {
        return true;
      }
      return false;
    },
    *closeTaskByStlId({ payload }, { call }) {
      const { status, response } = yield call(closeTaskByStlId, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '操作成功！' });
        return response.datum;
      }
      createMessage({ type: 'warn', description: response.reason });
      return null;
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
    cleanFlow(state, { payload }) {
      return {
        ...state,
        fieldsConfig: {},
        flowForm: defaultFlowForm,
      };
    },
  },
};
