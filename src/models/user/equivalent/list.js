import { omit, clone } from 'ramda';
import {
  getList,
  deleteCommon,
  getLastCountDate,
  setLastCountDate,
} from '@/services/user/equivalent/equivalent';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  sumType: 'BY_STATEMENT_SUM',
};

export default {
  namespace: 'equivalent',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: undefined,
    record: undefined,
    formData: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = omit(['sortBy', 'sortDirection'], payload);
      const { response, status } = yield call(getList, newPayload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            list: clone(Array.isArray(response.rows) ? response.rows : []),
            total: response.total,
            record: newPayload.sumType,
          },
        });
      }
    },
    *removeItems({ payload }, { call, put, select }) {
      const { response, status } = yield call(deleteCommon, payload);
      if (status === 200) {
        const { searchForm } = yield select(({ equivalent }) => equivalent);
        yield put({ type: 'query', payload: searchForm });
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({
          type: 'error',
          description: response.reason,
        });
      }
    },

    // 查询最后结算日
    *getLastCountDate({ payload }, { call, put }) {
      const { response } = yield call(getLastCountDate);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              lastCountDate: response.datum,
            },
          },
        });
      }
      return {};
    },

    // 保存最后结算日
    *setLastCountDate({ payload }, { call, put, select }) {
      const { formData } = yield select(({ equivalent }) => equivalent);
      const { status, response } = yield call(setLastCountDate, formData.lastCountDate);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
