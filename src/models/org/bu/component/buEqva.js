import { findByBuId, saveEqvaByBuId, deleteBueqvaList } from '@/services/org/bu/component/buEqva';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectFinperiods } from '@/services/sys/baseinfo/eqvacost';
import createMessage from '@/components/core/AlertMessage';
import { message } from 'antd';

export default {
  namespace: 'orgbuEqva',

  state: {
    buId: 0,
    dataList: [],
    total: 0,
    expirys: 0,
    finPeriodData: [], // 财务期间
    jobType2Data: [], // 工种子类
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findByBuId, { buId: payload });

      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(response.datum) ? response.datum : [],
          buId: payload,
        },
      });
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
    // 保存
    *save({ payload }, { call, select, put }) {
      const { formData } = payload;
      let flag = true;
      if (!formData.buId) {
        createMessage({ type: 'error', description: '保存失败' });
        flag = false;
        return flag;
      }
      if (formData.id) {
        // 编辑的保存方法
        const { response, status } = yield call(saveEqvaByBuId, formData);
        if (status === 100) {
          // 主动取消请求
          // flag = false;
          // return flag;
          return false;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
          flag = false;
        }
      } else {
        // 新增的保存方法
        const { response, status } = yield call(saveEqvaByBuId, formData);
        if (status === 100) {
          // 主动取消请求
          // flag = false;
          // return flag;
          return false;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          if (response.datum === -99) {
            createMessage({ type: 'error', description: '已存在相同的资源当量收入' });
          } else {
            createMessage({ type: 'error', description: '保存失败' });
          }
          flag = false;
        }
      }
      return flag;
    },
    // 删除
    *delete({ payload }, { put, call }) {
      yield call(deleteBueqvaList, payload.ids);
      yield put({ type: 'query', payload: payload.buId });
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
