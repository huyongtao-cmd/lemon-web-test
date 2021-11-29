import {
  queryDistributes,
  cancelDistBroadcast,
  deleteDistByIds,
  selectUsers,
} from '@/services/user/distribute/distribute';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';

export default {
  namespace: 'userDist',

  state: {
    dataSource: [],
    total: 0,
    searchForm: {},
    resList: [],
    resSource: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        distTime: undefined,
        distTimeStart: payload && payload.distTime ? formatDT(payload.distTime[0]) : undefined,
        distTimeEnd: payload && payload.distTime ? formatDT(payload.distTime[1]) : undefined,
        disterResId: payload && payload.disterResId ? payload.disterResId.id : undefined,
      };
      const { response } = yield call(queryDistributes, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    *cancelDistBroadcast({ payload }, { call, put }) {
      const { status, response } = yield call(cancelDistBroadcast, payload.distId);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    *deleteDistByIds({ payload }, { call, put }) {
      const { status, response } = yield call(deleteDistByIds, payload.ids);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: response.reason });
      } else {
        createMessage({ type: 'error', description: '操作失败' });
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
