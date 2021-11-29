import {
  findSettlePriceList,
  settlePriceCreate,
  settlePriceUpdate,
  deleteSettlePrices,
} from '@/services/sys/baseinfo/settleprice';
import { selectFinperiods } from '@/services/sys/baseinfo/eqvacost';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'settlePricePlatDefinition',

  state: {
    searchForm: {
      buSearchKey: null, // BU
      jobType1: null, // 工种
      finYear: null, // 核算年度
      finPeriod: null, // 核算期间
      fromBuDealtype: null, // frombu 结算类型码
      toBuDealtype: null, // tobu 结算类型码
    },
    dataSource: [],
    total: 0,
    finPeriodData: [], // 财务期间
    jobType2Data: [], // 工种子类
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findSettlePriceList, payload);

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
      yield call(deleteSettlePrices, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
    },

    *settlePriceSave({ payload }, { call, select }) {
      let flag = true;
      const { formData } = payload;
      const {
        fromBuDealtype,
        toBuDealtype,
        fromBuId,
        toBuId,
        markupPercent,
        markupSolid,
        absoluteAmt,
      } = formData;
      if (fromBuId && fromBuDealtype) {
        createMessage({
          type: 'error',
          description: 'FromBU、FromBU结算码只能有一个进行数据的录入',
        });
        return false;
      }
      if (!fromBuId && !fromBuDealtype) {
        createMessage({ type: 'error', description: 'FromBU、FromBU结算码选择一个进行数据的录入' });
        return false;
      }
      if (toBuId && toBuDealtype) {
        createMessage({ type: 'error', description: 'TOBU、TOBU结算码只能有一个进行数据的录入' });
        return false;
      }
      if (!toBuId && !toBuDealtype) {
        createMessage({ type: 'error', description: 'TOBU、TOBU结算码选择一个进行数据的录入' });
        return false;
      }
      if (
        (markupPercent && markupSolid) ||
        (markupPercent && absoluteAmt) ||
        (markupSolid && absoluteAmt) ||
        (markupPercent && markupSolid && absoluteAmt)
      ) {
        createMessage({
          type: 'error',
          description: 'Markup百分比、Markup固定金额、Markup绝对结算金额只能有一个进行数据的录入',
        });
        return false;
      }
      if (!markupPercent && !markupSolid && !absoluteAmt) {
        createMessage({
          type: 'error',
          description: 'Markup百分比、Markup固定金额、Markup绝对结算金额选择一个进行数据的录入',
        });
        return false;
      }
      if (formData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(settlePriceUpdate, formData);
        if (status === 100) {
          // 主动取消请求
          return false;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
          flag = false;
        }
      } else {
        // 新增的保存方法
        const { status, response } = yield call(settlePriceCreate, formData);
        if (status === 100) {
          // 主动取消请求
          return false;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
          flag = false;
        }
      }
      return flag;
    },
    // 根据财务年度获取财务期间下拉数据
    *updateFinPeriod({ payload }, { call, put }) {
      if (!payload) {
        yield put({
          type: 'updateState',
          payload: { finPeriodData: [] },
        });
        return;
      }
      const { response } = yield call(selectFinperiods, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: { finPeriodData: Array.isArray(response) ? response : [] },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: { finPeriodData: [] },
        });
      }
    },
    // 根据工种获取工种子类的信息
    *updateJobType2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:JOB_TYPE2',
        parentDefId: 'COM:JOB_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            jobType2Data: Array.isArray(response) ? response : [],
          },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: { jobType2Data: [] },
        });
      }
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: { finPeriodData: [], jobType2Data: [] },
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
