import {
  queryMyResponses,
  selectUsers,
  changeDistStatus,
} from '@/services/user/distribute/distribute';
import { genFakeId } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userRespBroadcast',

  state: {
    dataSource: [],
    total: 0,
    searchForm: {},
    resList: [],
    resSource: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryMyResponses, payload);
      const newDataSource = Array.isArray(response.rows)
        ? response.rows.map(item => ({ ...item, key: genFakeId(-1) }))
        : [];
      yield put({
        type: 'updateState',
        payload: {
          dataSource: newDataSource,
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
    // 更新响应状态
    *changeDistStatusFn({ payload }, { call, put }) {
      const { response } = yield call(changeDistStatus, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '响应状态更新成功' });
        return true;
      }
      createMessage({ type: 'warn', description: '响应状态更新失败' });
      return false;
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
