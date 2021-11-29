import {
  findEqvaCostList,
  eqvaCostCreate,
  eqvaCostUpdate,
  deleteEqvaCosts,
  selectFinperiods,
} from '@/services/sys/baseinfo/eqvacost';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysBasicEqvaCost',

  state: {
    searchForm: {
      jobType1: null, // 工种
      finYear: null, // 核算年度
      finPeriod: null, // 核算期间
      busifieldType: null, // 平台编码
      buId: null, // BU
    },
    dataSource: [],
    total: 0,
    finPeriodData: [], // 财务期间
    jobType2Data: [], // 工种子类
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findEqvaCostList, payload);

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
      yield call(deleteEqvaCosts, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
    },

    *eqvaCostSave({ payload }, { call, select, put }) {
      const { eqvaCostFormData } = payload;
      let flag = true;
      if (eqvaCostFormData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(eqvaCostUpdate, eqvaCostFormData);
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
        const { status, response } = yield call(eqvaCostCreate, eqvaCostFormData);
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
