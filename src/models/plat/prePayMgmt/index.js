import createMessage from '@/components/core/AlertMessage';
import { queryPrePayMgmtList, savePreAccount } from '@/services/plat/prePayMgmt';
import { deletePrePay } from '@/services/user/center/prePay';
import moment from 'moment';

const defaultSearchForm = {};

export default {
  namespace: 'prePayMgmtList',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    buList: [],
    resList: [],
    adpayApplyIds: null, // 选中的预付款记录id字符串数组
    jdePay: {
      // jde报销记账表对象
      id: null,
      adpayApplyId: null,
      accountNo: null,
      accName: null,
      accCode: null,
      subAccCode: null,
      ledgerDate: moment().format('YYYY-MM-DD'),
      remark: null,
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryPrePayMgmtList, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *delete({ payload }, { call, put }) {
      const { status, response } = yield call(deletePrePay, payload);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        return true;
      }
      createMessage({ type: 'error', description: response.errCode || '删除失败' });
      return false;
    },
    *savePreAccount({ payload }, { call, select, put }) {
      const { adpayApplyIds, jdePay } = yield select(({ prePayMgmtList }) => prePayMgmtList);
      if (!adpayApplyIds || adpayApplyIds.length === 0) {
        createMessage({ type: 'warn', description: '请先选择记录！' });
        return {};
      }
      const { state, response } = yield call(savePreAccount, {
        adpayApplyIds: adpayApplyIds.join(','),
        jdePay,
      });
      if (state === 100) {
        return {};
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            adpayApplyIds: null,
            jdePay: {
              id: null,
              accPayBatchId: null,
              accName: null,
              accCode: null,
              subAccCode: null,
              ledgerDate: moment().format('YYYY-MM-DD'),
              remark: null,
            },
          },
        });
      } else {
        createMessage({ type: 'error', description: '保存失败！' + response.reason });
      }
      return response;
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
