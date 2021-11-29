import { omit } from 'ramda';
import { findUserTaskById, queryActList } from '@/services/user/task/task';
import {
  saveTaskChange,
  startTaskChange,
  approvalTaskChange,
  findTaskChangeById,
} from '@/services/user/task/change';
import { genFakeId } from '@/utils/mathUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userTaskChange',

  state: {
    // 查询系列
    formData: {},
    dataList: [],
    changeTableList: [],
    actList: [],
    actSource: [],
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {}, // taskEntity
          dataList: [], // taskEntity.resActivityList
          changeTableList: [], // taskChangedtlEntities
          // taskChangeEntity 变更主表实体类
        },
      });
    },

    *query({ payload }, { call, put }) {
      const { status, response } = yield call(findTaskChangeById, payload.id);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const {
          datum: { taskView = {}, taskChangeView = {}, taskChangedtlViews = [] },
        } = response;
        const dataList =
          taskView && Array.isArray(taskView.resActivityList) ? taskView.resActivityList : [];
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...taskView,
              changeDesc: taskChangeView && taskChangeView.changeDesc,
              changeId: taskChangeView && taskChangeView.id,
            },
            dataList,
            // taskView,taskChangeView,taskChangedtlViews
            changeTableList: taskChangedtlViews,
          },
        });

        // 事由号带项目列表
        if (taskView && taskView.reasonId) {
          yield put({
            type: 'queryActList',
            payload: taskView.reasonId,
          });
        }
      } else if (response.errCode) {
        createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '查询失败,请联系管理员' });
      }
    },

    *queryTask({ payload }, { call, put }) {
      const { status, response } = yield call(findUserTaskById, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const { datum } = response;
        const formData = datum ? { ...datum, planEqva: datum.eqvaQty } : {};
        const dataList = Array.isArray(formData.resActivityList)
          ? formData.resActivityList.map(item => ({ ...item, planEqva: item.eqvaQty }))
          : [];
        const changeTableList = dataList.map(item => ({
          id: genFakeId(-1),
          resActivityId: item.id,
          resActivityDesc: item.actName,
          oldEqva: item.eqvaQty,
          deltaEava: 0,
          newEqva: item.eqvaQty,
          changeDesc: null,
          approveDesc: null,
        }));

        yield put({
          type: 'updateState',
          payload: { formData, dataList, changeTableList },
        });

        // 事由号带项目列表
        if (datum && datum.reasonId) {
          yield put({
            type: 'queryActList',
            payload: datum.reasonId,
          });
        }
      } else if (response.errCode) {
        createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '查询失败,请联系管理员' });
      }
    },
    *queryActList({ payload }, { call, put }) {
      const { response } = yield call(queryActList, payload);
      if (response && response.datum) {
        yield put({
          type: 'updateState',
          payload: {
            actList: Array.isArray(response.datum) ? response.datum : [],
            actSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      const { formData, dataList, changeTableList } = payload;
      formData.resActivityList = dataList;
      const { status, response } = yield call(saveTaskChange, {
        // taskEntity: omit(['planEqva'], formData),
        taskEntity: formData,
        taskChangeEntity: {
          changeDesc: formData.changeDesc || null,
          taskId: formData.id,
          id: formData.changeId || null,
        },
        taskChangedtlEntities: changeTableList,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const { datum } = response;
        if (payload.apprId) {
          // 再次提交流程
          const result = yield call(approvalTaskChange, payload);
          if (result.status === 200) {
            createMessage({ type: 'success', description: '操作成功' });
          } else {
            createMessage({ type: 'error', description: '流程提交失败,请联系管理员' });
            return;
          }
          closeThenGoto(`/user/flow/process`);
        }
        // 提起流程
        else if (datum && datum.taskChangeEntity && datum.taskChangeEntity.id) {
          const result = yield call(startTaskChange, datum.taskChangeEntity.id); // changeId
          if (result.status === 200) {
            createMessage({ type: 'success', description: '操作成功' });
          } else {
            createMessage({ type: 'error', description: '流程提交失败,请联系管理员' });
            return;
          }
          closeThenGoto(`/user/flow/process`);
        } else {
          createMessage({ type: 'success', description: '保存成功，提交流程失败！' });
        }
      } else if (response.errCode) {
        createMessage({ type: 'warn', description: `操作未成功，原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '操作失败,请联系管理员' });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
