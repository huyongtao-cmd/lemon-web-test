import { queryResAccountDetailList } from '@/services/user/center/myTeam';

const defaultSearchForm = {
  sourceNo: undefined, // 业务单号
  sourceType: undefined, // 交易类型
  oledgerId: undefined, // From账户
  iledgerId: undefined, // To账户
  projId: undefined, // 相关项目
  taskId: undefined, // 相关任务
  settleDate: undefined, // 结算日期
  settleDateFrom: undefined, // 结算日期
  settleDateTo: undefined, // 结算日期
  date: undefined, // 期间
  dateFrom: undefined, // 期间
  dateTo: undefined, // 期间
};

export default {
  namespace: 'resAccountEquivalent',

  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: undefined,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { id, ...params } = payload;
      const { response } = yield call(queryResAccountDetailList, id, params);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    *clean({ payload }, { call, put }) {
      yield put({ type: 'updateState', payload: { dataSource: [], total: undefined } });
      yield put({ type: 'cleanSearchForm' });
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
  },
};
