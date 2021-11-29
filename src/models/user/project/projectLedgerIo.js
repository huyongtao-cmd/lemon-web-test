import { findLedgerIoByProj } from '@/services/user/project/project';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'userProjLedgerIo',

  state: {
    searchForm: {
      sourceNo: null, // 业务单号
      sourceType: null, // 交易类型
      oledgerId: null, // From账户
      iledgerId: null, // To账户
      taskId: null, // 相关任务
      settleDate: null, // 结算日期
      settleDateFrom: null, // 结算日期
      settleDateTo: null, // 结算日期
      date: null, // 期间
      dateFrom: null, // 期间
      dateTo: null, // 期间
    },
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const param = fromQs();
      const { response } = yield call(findLedgerIoByProj, { projId: param.projId, ...payload });
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
