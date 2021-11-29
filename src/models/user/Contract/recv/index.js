import { getRecvplanListPersonal } from '@/services/user/Contract/recvplan';

export default {
  namespace: 'recvContract',
  state: {
    searchForm: {
      // 子合同编号
      subContractNo: null,
      // 主合同名称
      mainContractName: null,
      // 子合同名称
      subContractName: null,
      // 客户名称
      custName: null,
      // 交付BU
      deliBuId: null,
      // 收款账号
      recvNo: null,
      // 收款状态
      recvStatus: null,
      // 预期收款日期
      expectRecvDateStart: null,
      expectRecvDateEnd: null,
      // 开票日期
      invDateStart: null,
      invDateEnd: null,
      // 实际收款日期
      actualRecvDateStart: null,
      actualRecvDateEnd: null,
      pmoResId: null,
    },
    recvPlanList: [], // 合同收款计划列表
    delList: [],
    total: 0,
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(getRecvplanListPersonal, payload);
      yield put({
        type: 'updateState',
        payload: {
          recvPlanList: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
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
