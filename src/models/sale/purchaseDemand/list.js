import { purchaseDemandListRq } from '@/services/sale/purchaseDemand/purchaseDemand';
import { queryUserPrincipal } from '@/services/gen/user';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'salePurchaseDemandList',
  state: {
    listData: [],
    searchForm: {},
    total: 0,
    params: {},
    user: {},
    pageConfig: {
      pageBlockViews: [],
    },
  },
  effects: {
    /* 获取采购采购需求列表 */
    *queryList({ payload }, { call, put, select }) {
      const { uploadDate, ...params } = payload;
      if (Array.isArray(uploadDate) && (uploadDate[0] || uploadDate[1])) {
        [params.startDate, params.endDate] = uploadDate;
      }
      const { response } = yield call(purchaseDemandListRq, params);
      console.warn(response);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listData: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
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
    clear(state, { payload }) {
      return {
        ...state,
        listData: [],
        searchForm: {},
        total: 0,
        params: {},
        user: {},
        pageConfig: {},
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
