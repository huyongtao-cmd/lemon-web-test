import { isNil, isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { selectUserProj } from '@/services/gen/list';
import { selectAccount, selectContract } from '@/services/user/expense/expense';
import { updatePrePay, getPrePayDetail } from '@/services/user/center/prePay';
import { pushFlowTask, getFlowInfoByTaskInfo } from '@/services/gen/flow';

export default {
  namespace: 'prePayEdit',
  state: {
    formData: {},
    buList: [],
    resList: [],
    orgList: [],
    accList: [],
    contractList: [],
    particularList: [],
    expenseBuList: [],
    reasonList: [],
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(getPrePayDetail, payload);
      if (status === 200) {
        const formData = response.datum || {};
        const { applyResId, supplierId } = formData;
        const params = isNil(supplierId) ? { resId: applyResId } : { supplierId };
        yield put({ type: 'queryAccSelect', payload: params });
        yield put({ type: 'queryContract', payload: applyResId });
        yield put({ type: 'queryReasonList', payload: { resId: applyResId } });
        yield put({ type: 'updateForm', payload: formData });
      }
    },
    *queryReasonList({ payload }, { call, put }) {
      const { response } = yield call(selectUserProj, payload);
      yield put({
        type: 'updateState',
        payload: {
          reasonList: Array.isArray(response) ? response : [],
        },
      });
    },
    *queryAccSelect({ payload }, { call, put }) {
      const { resId, supplierId } = payload;
      const { response } = yield call(selectAccount, resId, supplierId);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          accList: list.map(item => ({
            ...item,
            accountNo: item.accountNo.replace(/(\d{4})(?=\d)/g, '$1 '),
          })),
        },
      });
    },
    *queryContract({ payload }, { call, put }) {
      const { response } = yield call(selectContract, payload);
      yield put({
        type: 'updateState',
        payload: {
          contractList: Array.isArray(response) ? response : [],
        },
      });
    },
    *getFlowInfo({ payload }, { call, put }) {
      const { status, response } = yield call(getFlowInfoByTaskInfo, payload);
      if (status === 200 && !isEmpty(response)) {
        const { NO, docName, id, isTodo, taskId } = response || {};
        // todo: 这里如果 taskId 单据详情里给的话，就不需要拉这个了，可以通过单据信息来执行 resubmit
      }
    },
    *update({ payload }, { call, put }) {
      const { status, response } = yield call(updatePrePay, payload);
      if (status === 200) {
        const { submitted } = payload;
        if (response && response.ok) {
          createMessage({ type: 'success', description: submitted ? '提交成功' : '保存成功' });
          submitted && closeThenGoto(`/user/center/prePay`);
        } else {
          const message = response.reason || (submitted ? '提交失败' : '保存失败');
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *resubmit({ payload }, { call, put }) {
      const { remarkUrl, taskId, result, ...params } = payload;
      const { status, response } = yield call(updatePrePay, params);
      if (status === 200) {
        if (response && response.ok) {
          const { status: apprSts, response: res } = yield call(pushFlowTask, taskId, {
            taskId,
            result,
            remark: remarkUrl !== 'undefined' ? remarkUrl : null,
          });
          if (apprSts === 100) {
            // 主动取消请求
          } else if (!!res && res.ok) {
            createMessage({ type: 'success', description: '提交成功' });
            closeThenGoto(`/user/center/prePay`);
          } else {
            createMessage({ type: 'warn', description: '提交失败' });
          }
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
