import {
  queryInvite,
  selectUsers,
  interested,
  notApplicable,
} from '@/services/user/distribute/distribute';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';

export default {
  namespace: 'userInvitation',

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
      const { response } = yield call(queryInvite, newPayload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
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
      const { status, response } = yield call(interested, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { searchForm } = yield select(({ userInvitation }) => userInvitation);
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
      const { status, response } = yield call(notApplicable, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { searchForm } = yield select(({ userInvitation }) => userInvitation);
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
