import { getMyListHandle, closeMyFeedbackHandle } from '@/services/plat/feedback';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'issueMyFeedbacks',

  state: {
    dataSource: [],
    total: 0,
    queryParams: {
      solveState: 'SOLVING',
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const res = yield call(getMyListHandle, payload);
      if (res.status === 200 && res.response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.response.rows,
            total: res.response.total,
            queryParams: payload,
          },
        });
      }
    },
    *close({ payload }, { call, put, select }) {
      const res = yield call(closeMyFeedbackHandle, payload);
      if (res.response.ok) {
        createMessage({ type: 'success', description: '关闭成功' });
        const params = yield select(({ issueMyFeedbacks: { queryParams } }) => queryParams);
        yield put({
          type: 'query',
          payload: params,
        });
      } else {
        createMessage({ type: 'error', description: '关闭失败' });
      }
    },
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, { pageNo: payload.pageNo });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
      }
      return {};
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
