import {
  findProfitdistRuleList,
  deleteProfitdistRules,
} from '@/services/sys/baseinfo/profitdistrule';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysBasicProfitdistRule',

  state: {
    searchForm: {
      ruleNo: null, // 分配规则码
      ouId: null, // 签单法人主体
      buFactor2: null, // BU小类
      buId: null, // BU
      buFactor1: null, // BU类别
      custId: null, // 客户编号
      custFactor2: null, // 客户小类
      custFactor1: null, // 客户类别
      custFactor3: null, // 客户属性类型
      projFactor1: null, // 项目属性
      prodId: null, // 销售品项编码
      prodFactor2: null, // 品项小类别
      prodFactor1: null, // 品项类别
      prodFactor3: null, // 品项属性类别
      projFactor2: null, // 交易类型
      cooperationType: null, // 合作类型
      promotionType: null, // 促销类型
    },
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findProfitdistRuleList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 删除
    *delete({ payload }, { put, call }) {
      yield call(deleteProfitdistRules, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
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
