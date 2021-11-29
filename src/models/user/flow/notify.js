import { getNotify, readNotifyBatch } from '@/services/user/flow/flow';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  no: undefined,
  name: undefined,
  info: undefined,
  startTime: undefined,
  initiatorName: undefined,
  defId: undefined,
};

export default {
  namespace: 'flowNotify',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { sinceDate, untilDate } = payload;
      const params = { ...payload };
      if (sinceDate && typeof sinceDate !== 'string') {
        params.sinceDate = sinceDate.format('YYYY-MM-DD');
      }
      if (untilDate && typeof untilDate !== 'string') {
        params.untilDate = untilDate.format('YYYY-MM-DD');
      }
      const { response, status } = yield call(getNotify, params);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },
    *readNotifyBatch({ payload }, { call, put }) {
      const { response, status } = yield call(readNotifyBatch, payload);
      if (status === 100) return;
      if (status === 200) {
        createMessage({ type: 'success', description: '批量已读成功' });
        yield put({
          type: 'query',
        });
      } else {
        createMessage({ type: 'warn', description: '批量已读失败' });
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
  },
};
