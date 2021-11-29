/* eslint-disable consistent-return */
/* eslint-disable prefer-const */
/* eslint-disable no-nested-ternary */
import moment from 'moment';
import {
  deleteCalendarList,
  getViewCalendarList,
  deleteCalendar,
} from '@/services/cservice/manage';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};
const convertQueryParams = queryParams => {
  if (queryParams === void 0) return;
  let params = queryParams;
  if (params.createTime) {
    params.createTimeStart = params.createTime[0].format('YYYY-MM-DD');
    params.createTimeEnd = params.createTime[1].format('YYYY-MM-DD');
    params.createTime = void 0;
  }
  return params;
};

export default {
  namespace: 'viewCalendarList',
  state: {
    list: [],
    total: 0,
    searchForm: {},
    meetingRoomPlace: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { id } = payload;
      const { status, response } = yield call(getViewCalendarList, id);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 删除
    *delete({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ viewCalendarList }) => viewCalendarList);
      const { status, response } = yield call(deleteCalendarList, payload);
      const { configId } = searchForm;
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          yield put({
            type: 'query',
            payload: { ...searchForm, id: configId },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
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
          selectedRowKeys: [], // 清空选中项，因为searchForm里面记录了这个东西
        },
      };
    },
  },
};
