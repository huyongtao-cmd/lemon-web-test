import { queryRecvplanList, saveRecvplanList, defaultRuleRq } from '@/services/plat/recv/Contract';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'contractRecv',
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
    },
    recvPlanList: [], // 合同收款计划列表
    delList: [],
    total: 0,
    flag: false,
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(queryRecvplanList, payload);
      yield put({
        type: 'updateState',
        payload: {
          recvPlanList: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    *save({ payload }, { call, put, select }) {
      const { recvPlanList, delList } = yield select(({ contractRecv }) => contractRecv);
      const { status, response } = yield call(saveRecvplanList, {
        entities: recvPlanList,
        delList,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },
    *defaultRule({ payload }, { call, put, select }) {
      const { status, response } = yield call(defaultRuleRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        response.reason
          .split(';')
          .map(res => createMessage({ type: 'success', description: res || '操作成功' }));
      } else {
        response.reason
          .split(';')
          .map(res => createMessage({ type: 'error', description: res || '操作失败' }));
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
