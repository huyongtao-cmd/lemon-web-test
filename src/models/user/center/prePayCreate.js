import { isNil } from 'ramda';
import moment from 'moment';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { queryUserPrincipal } from '@/services/gen/user';
import { selectUserProj } from '@/services/gen/list';
import { selectAccount, selectContract } from '@/services/user/expense/expense';
import { createPrePay } from '@/services/user/center/prePay';

export default {
  namespace: 'prePayCreate',
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
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { resId, resName, jobGrade, baseBuId } = response.extInfo || {};

        yield put({
          type: 'updateState',
          payload: {
            formData: {
              applyResId: isNil(resId) ? undefined : resId,
              applyResName: resName,
              applyBuId: baseBuId,
              resId,
              applyDate: moment().format('YYYY-MM-DD'),
            },
          },
        });
        if (!isNil(resId)) {
          yield put({ type: 'queryAccSelect', payload: { resId } });
          yield put({ type: 'queryContract', payload: resId });
          yield put({ type: 'queryReasonList', payload: { resId } });
        }
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
    *create({ payload }, { call, put }) {
      const { status, response } = yield call(createPrePay, payload);
      if (status === 200) {
        const { submitted } = payload;
        if (response && response.ok) {
          createMessage({ type: 'success', description: submitted ? '提交成功' : '保存成功' });
          closeThenGoto(`/user/center/prePay`);
        } else {
          const message = response.reason || (submitted ? '提交失败' : '保存失败');
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
