/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
import moment from 'moment';
import {
  getMeetingRoomName,
  createReservedRoom,
  updateReservedRoom,
  getReservedRoomById,
} from '@/services/user/meeting';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { selectBus } from '@/services/gen/list';

const formatData = data => {
  data.starTime = moment(data.starTime).format('HH:mm');
  data.endTime = moment(data.endTime).format('HH:mm');
  return data;
};
const formatDetail = data => {
  data.starTime = moment(`${data.startDate} ${data.starTime}`);
  data.endTime = moment(`${data.endDate} ${data.endTime}`);
  return data;
};

export default {
  namespace: 'meetingReserveListDetail',
  state: {
    list: [],
    total: 0,
    searchForm: {},
    currentItem: {},
    meetingRoomList: [], // 会议室列表
    createUserList: [], // 申请人列表
    buList: [], // 申请人BU
    pageConfig: {},
  },

  effects: {
    *queryDetail({ payload }, { call, put, select }) {
      const { mode, resName, baseBuName } = payload;
      if (mode === 'create') {
        // 这是从会议详情情况页面跳转过来的
        if (payload.formPage === 'reserveDetail') {
          const { date, meetingName } = payload;
          yield put({
            type: 'updateState',
            payload: {
              currentItem: {
                meetingName,
                buName: baseBuName,
                createUserName: resName,
                createTime: moment(),
                startDate: date,
                endDate: date,
                isNeedVideo: 'NO',
                isNeedProjector: 'NO',
                isNeedPhone: 'NO',
              },
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              currentItem: {
                buName: baseBuName,
                createUserName: resName,
                createTime: moment(),
                isNeedVideo: 'NO',
                isNeedProjector: 'NO',
                isNeedPhone: 'NO',
              },
            },
          });
        }
      } else {
        const { id } = payload;
        const { status, response } = yield call(getReservedRoomById, id);
        // 格式化数据
        const currentItem = formatDetail(response.datum);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          yield put({
            type: 'updateState',
            payload: {
              currentItem,
            },
          });
        }

        return {};
      }
      return {};
    },
    // 保存
    *save({ payload }, { call, put, select }) {
      const { mode, values, buId } = payload;
      if (mode === 'create') {
        const params = formatData(values);
        const { status, response } = yield call(createReservedRoom, { buId, ...params });
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
        const params = formatData(values);
        const { id } = payload;
        const { status, response } = yield call(updateReservedRoom, { id, buId, ...params });
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

    // 获取会议室列表
    *getMeetingRoom({ payload }, { call, put, select }) {
      const { status, response } = yield call(getMeetingRoomName);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        yield put({ type: 'updateState', payload: { meetingRoomList: response.datum } });
      }
      return {};
    },

    // 获取申请人列表
    *getCreateUserList({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          createUserList: list,
        },
      });
    },

    // 获取bulist
    *queryBuSelect({ payload }, { call, put }) {
      const { response } = yield call(selectBus);
      yield put({
        type: 'updateState',
        payload: {
          buList: Array.isArray(response) ? response : [],
        },
      });
    },

    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
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
