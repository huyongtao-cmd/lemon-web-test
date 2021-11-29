import {
  queryAddrList,
  findAddrById,
  deleteAddrById,
  insertCustSupplierToU8cRp,
} from '@/services/plat/addr/addr';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';

export default {
  namespace: 'platAddrList',

  state: {
    // 查询系列
    searchForm: {},
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(queryAddrList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },

    // 删除地址簿
    *deleteRow({ payload }, { call, put }) {
      const { response, status } = yield call(deleteAddrById, payload);
      return {
        success: response,
        status,
      };
    },

    // 同步
    *changeSync({ payload }, { call, put }) {
      const { response, status } = yield call(insertCustSupplierToU8cRp, payload);
      return {
        success: response.ok,
        errors: response.errors[0],
        status,
      };
      // return response.data;
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
