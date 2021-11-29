/* eslint-disable no-nested-ternary */
import moment from 'moment';
import { createMeetingRoom, getMeetingRoomById, updateMeetingRoom } from '@/services/user/meeting';

export default {
  namespace: 'meetingRoomListDetail',
  state: {
    list: [],
    total: 0,
    searchForm: {},
    currentItem: {},
  },

  effects: {
    *queryDetail({ payload }, { call, put, select }) {
      const { mode, userId } = payload;
      if (mode === 'create') {
        yield put({
          type: 'updateState',
          payload: {
            currentItem: { meetingRoomStatus: '01', createTime: moment(), createUserId: userId },
          },
        });
      } else {
        const { id } = payload;
        const { status, response } = yield call(getMeetingRoomById, id);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          yield put({
            type: 'updateState',
            payload: {
              currentItem: response.datum,
            },
          });
        }
      }
      return {};
    },
    // 保存
    *save({ payload }, { call, put, select }) {
      const { mode, values } = payload;
      if (mode === 'create') {
        const { status, response } = yield call(createMeetingRoom, values);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          return response;
        }
        return {};
      }
      if (mode === 'edit') {
        const { id } = payload;
        const { status, response } = yield call(updateMeetingRoom, { id, ...values });
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          return response;
        }
        return {};
      }
      return {};
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
