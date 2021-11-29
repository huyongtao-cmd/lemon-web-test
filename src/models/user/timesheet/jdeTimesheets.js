import moment from 'moment';
import { queryJdeTimesheetReport } from '@/services/user/timesheet/timesheet';

const defaultSearchForm = {
  dateRangeStart: moment()
    .add(-1, 'months')
    .startOf('month'),
  dateRangeTo: moment()
    .add(-1, 'months')
    .endOf('month'),
};

export default {
  namespace: 'jdeTimesheets',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
  },

  /**
   * 异步处理,通过调用reducers间接修改state
   */
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryJdeTimesheetReport, payload);
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
  },

  /**
   * 同步处理,所有state的变更都必须通过reducers
   */
  reducers: {
    /**
     * 更新表格数据
     * @param state
     * @param action
     * @returns {{}}
     */
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    /**
     * 更新查询条件
     * @param state 更改前的值
     * @param payload 掉用该方法传过来的值
     * @returns {{searchForm: {}}}  更改后的值
     */
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = {
        ...searchForm,
        dateRangeStart: payload.dateRange[0],
        dateRangeTo: payload.dateRange[1],
      };
      return {
        ...state,
        searchForm: newFormData,
      };
    },

    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {},
      };
    },
  },
};
