import { dataMart, dataChartAllByNo } from '@/services/sys/system/dataWarehouse';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty, isNil } from 'ramda';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';

const defaultFormData = {};

export default {
  namespace: 'buCabin',
  state: {
    gradeTypeList: [],
    gradeTypeListDel: [],
    objectiveCat1Data: [],
    objectiveCat2Data: [],
    type1Key: 'SALE',
    type2Key: 'INCOME',

    sumSaleChart: {
      extractInfo: {},
      data: [],
    },
    sumExpenseChart: {
      extractInfo: {},
      data: [],
    },
    saleIncomeObjectiveStatisticChart: {
      extractInfo: {},
      data: [],
    },
    saleIncomeObjectiveScoreDistributionChart: {
      extractInfo: {},
      data: [],
    },
    saleIncomeObjectiveScoreSumChart: {
      extractInfo: {},
      data: [],
    },
    saleExpenseObjectiveStatisticChart: {
      extractInfo: {},
      data: [],
    },
    saleExpenseObjectiveScoreDistChart: {
      extractInfo: {},
      data: [],
    },
    saleExpenseObjectiveScoreSumChart: {
      extractInfo: {},
      data: [],
    },
  },

  effects: {
    *initData({ payload }, { call, put }) {
      // 累计总销售额
      const { response: sumSaleResponse } = yield call(dataChartAllByNo, {
        no: 'SUM_SALE_CHART_1',
      });
      yield put({ type: 'updateState', payload: { sumSaleChart: sumSaleResponse } });
      // 累计总费用支出
      const { response: sumExpenseResponse } = yield call(dataChartAllByNo, {
        no: 'SUM_EXPENSE_CHART_1',
      });
      yield put({ type: 'updateState', payload: { sumExpenseChart: sumExpenseResponse } });
    },

    *initTypeData({ payload }, { call, put }) {
      const { response: objectiveCat1Data } = yield call(queryUdc, 'OKR:OBJECTIVE_CAT1');
      const { response: objectiveCat2Data } = yield call(queryCascaderUdc, {
        defId: 'OKR:OBJECTIVE_CAT2',
        parentDefId: 'OKR:OBJECTIVE_CAT1',
        parentVal: objectiveCat1Data[0].code,
      });
      const type1Key = objectiveCat1Data[0].code;
      const type2Key = objectiveCat2Data[0].code;

      // 销售收入类OKR统计
      const { response: saleIncomeObjectiveStatisticResponse } = yield call(dataChartAllByNo, {
        no: 'SALE_INCOME_OBJECTIVE_STATISTIC_CHART',
        extVarchar5: type1Key,
        extVarchar6: type2Key,
      });
      // 销售收入类OKR评分分布
      const { response: saleIncomeObjectiveScoreDistributionResponse } = yield call(
        dataChartAllByNo,
        {
          no: 'SALE_INCOME_OBJECTIVE_SCORE_DISTRIBUTION',
          extVarchar3: type1Key,
          extVarchar4: type2Key,
        }
      );
      // 销售收入类OKR评分汇总
      const { response: saleIncomeObjectiveScoreSumResponse } = yield call(dataChartAllByNo, {
        no: 'SALE_INCOME_OBJECTIVE_SCORE_SUM',
        extVarchar3: type1Key,
        extVarchar4: type2Key,
      });

      yield put({
        type: 'updateState',
        payload: {
          saleIncomeObjectiveStatisticChart: saleIncomeObjectiveStatisticResponse,
          saleIncomeObjectiveScoreDistributionChart: saleIncomeObjectiveScoreDistributionResponse,
          saleIncomeObjectiveScoreSumChart: saleIncomeObjectiveScoreSumResponse,
          objectiveCat1Data,
          objectiveCat2Data,
          type1Key,
          type2Key,
        },
      });
    },

    *tab1Change({ payload }, { call, put }) {
      const { type1Key } = payload;
      const { response: objectiveCat2Data } = yield call(queryCascaderUdc, {
        defId: 'OKR:OBJECTIVE_CAT2',
        parentDefId: 'OKR:OBJECTIVE_CAT1',
        parentVal: type1Key,
      });
      let type2Key;
      if (objectiveCat2Data.length === 0) {
        type2Key = undefined;
      } else {
        type2Key = objectiveCat2Data[0].code;
      }

      // 销售收入类OKR统计
      const { response: saleIncomeObjectiveStatisticResponse } = yield call(dataChartAllByNo, {
        no: 'SALE_INCOME_OBJECTIVE_STATISTIC_CHART',
        extVarchar5: type1Key,
        extVarchar6: type2Key,
      });
      // 销售收入类OKR评分分布
      const { response: saleIncomeObjectiveScoreDistributionResponse } = yield call(
        dataChartAllByNo,
        {
          no: 'SALE_INCOME_OBJECTIVE_SCORE_DISTRIBUTION',
          extVarchar3: type1Key,
          extVarchar4: type2Key,
        }
      );
      // 销售收入类OKR评分汇总
      const { response: saleIncomeObjectiveScoreSumResponse } = yield call(dataChartAllByNo, {
        no: 'SALE_INCOME_OBJECTIVE_SCORE_SUM',
        extVarchar3: type1Key,
        extVarchar4: type2Key,
      });

      yield put({
        type: 'updateState',
        payload: {
          saleIncomeObjectiveStatisticChart: saleIncomeObjectiveStatisticResponse,
          saleIncomeObjectiveScoreDistributionChart: saleIncomeObjectiveScoreDistributionResponse,
          saleIncomeObjectiveScoreSumChart: saleIncomeObjectiveScoreSumResponse,
          objectiveCat2Data,
          type1Key,
          type2Key,
        },
      });
    },

    *tab2Change({ payload }, { call, put }) {
      const { type1Key, type2Key } = payload;
      // OKR统计
      const { response: saleIncomeObjectiveStatisticResponse } = yield call(dataChartAllByNo, {
        no: 'SALE_INCOME_OBJECTIVE_STATISTIC_CHART',
        extVarchar5: type1Key,
        extVarchar6: type2Key,
      });
      // OKR评分分布
      const { response: saleIncomeObjectiveScoreDistributionResponse } = yield call(
        dataChartAllByNo,
        {
          no: 'SALE_INCOME_OBJECTIVE_SCORE_DISTRIBUTION',
          extVarchar3: type1Key,
          extVarchar4: type2Key,
        }
      );
      // OKR评分汇总
      const { response: saleIncomeObjectiveScoreSumResponse } = yield call(dataChartAllByNo, {
        no: 'SALE_INCOME_OBJECTIVE_SCORE_SUM',
        extVarchar3: type1Key,
        extVarchar4: type2Key,
      });

      yield put({
        type: 'updateState',
        payload: {
          saleIncomeObjectiveStatisticChart: saleIncomeObjectiveStatisticResponse,
          saleIncomeObjectiveScoreDistributionChart: saleIncomeObjectiveScoreDistributionResponse,
          saleIncomeObjectiveScoreSumChart: saleIncomeObjectiveScoreSumResponse,
          type2Key,
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
  },
};
