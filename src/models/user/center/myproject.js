import { findMyProjectList } from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userMyProject',

  state: {
    searchForm: {
      projectSearchKey: null, // 项目名称/编号
      userdefinedNo: null, // 参考合同号
      deliBuId: null, // 交付BU
      pmResId: null, // 项目经理
      workType: null, // 工作类型
      projStatus: null, // 项目状态
      salesmanResId: null, // 销售负责人
    },
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findMyProjectList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
