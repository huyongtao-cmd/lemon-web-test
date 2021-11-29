import {
  findSettlePriceList,
  settlePriceCreate,
  settlePriceUpdate,
  deleteSettlePrices,
} from '@/services/sys/baseinfo/settleprice';
import { selectFinperiods } from '@/services/sys/baseinfo/eqvacost';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { selectbuPriceList } from '@/services/gen/list';

const defaultSearchForm = {
  buSearchKey: null, // BU
  jobType1: null, // 工种
  finYear: null, // 核算年度
  finPeriod: null, // 核算期间
  fromBuDealtype: null, // frombu 结算类型码
  toBuDealtype: null, // tobu 结算类型码
};

export default {
  namespace: 'settlePriceBuDefinition',

  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: 0,
    finPeriodData: [], // 财务期间
    jobType2Data: [], // 工种子类
    buFormData: {
      buId: null,
      buName: null,
      closedFlag: false,
    },
    buList: [],
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
      yield put({
        type: 'query',
        payload: { ...payload.queryParams, filterBuId: payload.filterBuId },
      });
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
        resId,
      } = formData;
      if (fromBuId && fromBuDealtype) {
        createMessage({
          type: 'error',
          description: 'FromBU、FromBU结算码只能有一个进行数据的录入',
        });
        return false;
      }
      if (!fromBuId && !fromBuDealtype) {
        createMessage({ type: 'warn', description: 'FromBU、FromBU结算码选择一个进行数据的录入' });
        return false;
      }

      let toCount = 0;
      if (toBuDealtype) {
        toCount += 1;
      }
      if (toBuId) {
        toCount += 1;
      }
      if (resId) {
        toCount += 1;
      }
      if (toCount !== 1) {
        createMessage({ type: 'warn', description: 'TO BU类型码,TO BU,资源三者填写其中一个' });
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
    *queryBu({ payload }, { call, put }) {
      const { closedFlag } = payload;
      const { response } = yield call(selectbuPriceList, payload);
      const list = Array.isArray(response.datum) ? response.datum : [];
      yield put({
        type: 'updateState',
        payload: {
          buList: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: {
          buId: Array.isArray(response.datum) ? response.datum[0].id : null,
          buName: Array.isArray(response.datum) ? response.datum[0].name : null,
          closedFlag,
        },
      });
      return response.datum;
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: { finPeriodData: [], jobType2Data: [], searchForm: defaultSearchForm },
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
    updateForm(state, { payload }) {
      const { buFormData } = state;
      const newFormData = { ...buFormData, ...payload };
      return {
        ...state,
        buFormData: newFormData,
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
