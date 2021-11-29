import createMessage from '@/components/core/AlertMessage';
import { queryAdvanceVerificationList, querySingleList } from '@/services/plat/advanceVerification';
import { deletePrePay } from '@/services/user/center/prePay';
import moment from 'moment';

const defaultSearchForm = {};

export default {
  namespace: 'advanceVerificationList',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    singleList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryAdvanceVerificationList, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *querySingleList({ payload }, { call, put }) {
      const { response } = yield call(querySingleList, payload.id);
      if (response) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            singleList: Array.isArray(datum) ? datum : [],
          },
        });
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
