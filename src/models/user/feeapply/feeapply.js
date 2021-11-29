import { findFeeApplysList, deleteFeeApplys } from '@/services/user/feeapply/feeapply';
import { formatDT } from '@/utils/tempUtils/DateTime';

export default {
  namespace: 'userFeeApplyList',

  state: {
    searchForm: {
      applyNo: null, // 申请单号
      applyName: null, // 申请单名称
      usageType: null, // 用途类型
      reason: null, // 相关项目
      expenseBu: null, // 费用承担BU
      sumBu: null, // 费用归属BU
      applyDate: null, // 费用申请日期
      applyDateS: null, // 费用申请日期开始
      applyDateE: null, // 费用申请日期结束
      apprStatus: null, // 申请状态
    },
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPyload = {
        ...payload,
        applyDate: undefined,
        applyDateS: payload && payload.applyDate ? formatDT(payload.applyDate[0]) : undefined,
        applyDateE: payload && payload.applyDate ? formatDT(payload.applyDate[1]) : undefined,
      };
      const { response } = yield call(findFeeApplysList, newPyload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 删除
    *delete({ payload }, { put, call }) {
      yield call(deleteFeeApplys, payload.ids);
      yield put({ type: 'query', payload: payload.queryParams });
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
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
  },
};
