/* eslint-disable consistent-return */
/* eslint-disable prefer-const */
/* eslint-disable no-nested-ternary */
import moment from 'moment';
import { deleteReservedRoom, getReservedRoomList } from '@/services/user/meeting';
import createMessage from '@/components/core/AlertMessage';

const convertQueryParams = queryParams => {
  if (queryParams === void 0) return;
  let params = queryParams;
  if (params.date) {
    params.startDate = params.date[0].format('YYYY-MM-DD');
    params.endDate = params.date[1].format('YYYY-MM-DD');
    params.date = void 0;
  }
  if (params.createTime) {
    params.createTimeStart = params.createTime[0].format('YYYY-MM-DD');
    params.createTimeEnd = params.createTime[1].format('YYYY-MM-DD');
    params.createTime = void 0;
  }
  return params;
};
export default {
  namespace: 'meetingReserveList',
  state: {
    list: [],
    total: 0,
    searchForm: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const params = convertQueryParams(payload);
      const { status, response } = yield call(getReservedRoomList, params);
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
      const { searchForm } = yield select(({ meetingRoomList }) => meetingRoomList);
      const { status, response } = yield call(deleteReservedRoom, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          yield put({
            type: 'query',
            payload: searchForm,
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
  },
};
