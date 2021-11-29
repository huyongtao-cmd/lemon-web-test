import { queryUserTravel, deleteTravelByIds } from '@/services/user/center/travel';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';

export default {
  namespace: 'userCenterTravel',

  state: {
    // 查询系列
    searchForm: {},
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        beginDate: payload && payload.beginDate ? formatDT(payload.beginDate[0]) : undefined,
        endDate: payload && payload.beginDate ? formatDT(payload.beginDate[1]) : undefined,
        isMy: 0,
      };
      const {
        response: { rows, total },
      } = yield call(queryUserTravel, newPayload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },
    *deleteRow({ payload }, { call, put }) {
      const { status, response } = yield call(deleteTravelByIds, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else {
        createMessage({ type: 'error', description: '删除失败' });
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
