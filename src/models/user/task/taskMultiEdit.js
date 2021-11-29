import createMessage from '@/components/core/AlertMessage';

import {
  taskMultiCreate,
  taskMultiModify,
  taskMultiDetail,
  queryReasonList,
  queryBuList,
  queryPreSaleList,
  queryActList,
} from '@/services/user/task/task';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectUsersWithBu, selectCapasetLevelBy } from '@/services/gen/list';

import { closeThenGoto } from '@/layouts/routerControl';
import { clone } from 'ramda';

export default {
  namespace: 'taskMultiEdit',
  state: {
    formData: {},
    dataSource: [],
    deleteKeys: [],
    jobType2List: [], // 工种子类UDC联动数据
    capasetLeveldList: [], // 复合能力列表
    taskProjSource: [],
    taskProjList: [], // 事由号-项目列表
    buSource: [],
    buList: [], // 事由号-bu列表
    preSaleSource: [],
    preSaleList: [], // 事由号-售前列表
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(taskMultiDetail, payload);
      if (status === 200) {
        const dataSource = clone(Array.isArray(response.rows) ? response.rows : []);
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            dataSource: Array.isArray(response.dtlViews) ? response.dtlViews : [],
            deleteKeys: [],
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.entity.id) {
        response = yield call(taskMultiModify, payload);
      } else {
        // 新增
        response = yield call(taskMultiCreate, payload);
      }
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 保存成功
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
            dataSource: [],
            deleteKeys: [],
          },
        });
        closeThenGoto(`/user/task/multi`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
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
      yield put({
        type: 'updateState',
        payload: {
          jobType2List: Array.isArray(response) ? response : [],
        },
      });
    },

    // 工种 + 工种子类 -> 复合能力 注意这里是两个字段联动一个，不是直接上下级关系。
    *updateCapasetLeveldList({ payload }, { call, put }) {
      const { jobType1, jobType2 } = payload;
      if (!jobType1 || !jobType2) {
        return;
      }
      const { response } = yield call(selectCapasetLevelBy, {
        jobType1,
        jobType2,
      });
      yield put({
        type: 'updateState',
        payload: {
          capasetLeveldList: Array.isArray(response) ? response : [],
        },
      });
    },

    *queryProjList({ payload }, { call, put }) {
      const { response } = yield call(queryReasonList);
      if (response.datum) {
        yield put({
          type: 'updateState',
          payload: {
            taskProjList: Array.isArray(response.datum) ? response.datum : [],
            taskProjSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    *queryBuList({ payload }, { call, put }) {
      const { response } = yield call(queryBuList);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            buList: Array.isArray(response.datum) ? response.datum : [],
            buSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    *queryPreSaleList({ payload }, { call, put }) {
      const { response } = yield call(queryPreSaleList);
      if (response.datum) {
        yield put({
          type: 'updateState',
          payload: {
            preSaleList: Array.isArray(response.datum) ? response.datum : [],
            preSaleSource: Array.isArray(response.datum) ? response.datum : [],
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
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
      };
    },
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
