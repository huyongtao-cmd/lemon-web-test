import {
  queryBroadcast,
  selectUsers,
  interestedOnBroadcast,
  unInterestedOnBroadcast,
} from '@/services/user/distribute/distribute';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import { formatDT } from '@/utils/tempUtils/DateTime';

export default {
  namespace: 'userBroadcast',

  state: {
    dataSource: [],
    total: 0,
    searchForm: {},
    resList: [],
    resSource: [],
    c2Data: [],
    c3Data: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        distTime: undefined,
        start: payload && payload.distTime ? formatDT(payload.distTime[0]) : undefined,
        end: payload && payload.distTime ? formatDT(payload.distTime[1]) : undefined,
      };
      const { response } = yield call(queryBroadcast, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 根据国家获取省的信息
    *updateListC2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:PROVINCE',
        parentDefId: 'COM:COUNTRY',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            c2Data: Array.isArray(response) ? response : [],
            c3Data: [],
          },
        });
      }
    },

    // 根据省获取市
    *updateListC3({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:CITY',
        parentDefId: 'COM:PROVINCE',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { c3Data: Array.isArray(response) ? response : [] },
        });
      }
    },

    // 获得资源下拉数据
    *queryResList({ payload }, { call, put }) {
      const response = yield call(selectUsers);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            resList: Array.isArray(response.response) ? response.response : [],
            resSource: Array.isArray(response.response) ? response.response : [],
          },
        });
      }
    },
    // 感兴趣
    *interested({ payload }, { call, put, select }) {
      // const newParam = { ...payload, distId: payload.id}
      // console.log('000000-->', payload)
      const { status, response } = yield call(interestedOnBroadcast, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { searchForm } = yield select(({ userBroadcast }) => userBroadcast);
        yield put({ type: 'query', payload: searchForm });
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    // 不感兴趣
    *uninterested({ payload }, { call, put, select }) {
      // console.log('11111-->', payload)
      const { status, response } = yield call(unInterestedOnBroadcast, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { searchForm } = yield select(({ userBroadcast }) => userBroadcast);
        yield put({ type: 'query', payload: searchForm });
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
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
