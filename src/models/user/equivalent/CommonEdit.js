import { pickAll } from 'ramda';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { mul } from '@/utils/mathUtils';
import { getInfo, putCommon, startProc } from '@/services/user/equivalent/equivalent';
import {
  selectUserProj,
  selectUserTask,
  selectActiveBu,
  selectTaskByProjIdInEqua,
} from '@/services/gen/list';
import { doTaskTaskApply } from '@/services/user/task/task';
import { selectUsers } from '@/services/sys/user';

export default {
  namespace: 'CommonEdit',
  state: {
    formData: {},
    projectList: [],
    taskList: [],
    resList: [],
    buList: [],
  },
  effects: {
    *queryList({ payload }, { call, put, all }) {
      const { projectData, resData, buData, formData } = yield all({
        projectData: call(selectUserProj),
        resData: call(selectUsers),
        buData: call(selectActiveBu),
        formData: call(getInfo, { id: payload }),
      });
      const projectList = Array.isArray(projectData.response) ? projectData.response : [];
      const resList = Array.isArray(resData.response) ? resData.response : [];
      const buList = Array.isArray(buData.response) ? buData.response : [];
      const infoData = formData.response.datum;
      const taskData = infoData.projId ? yield call(selectTaskByProjIdInEqua, infoData.projId) : {};
      const taskList = Array.isArray(taskData.response) ? taskData.response : [];

      const {
        settlePrice,
        eqvaSalary,
        applySettleEqva,
        projId,
        taskId,
        approveSettleAmt,
      } = infoData;
      // 编辑时，后台传的 applySettleAmt 应该事已经有值的，这里不做计算避免误差。
      // const applySettleAmt = mul(applySettleEqva || 0, settlePrice);
      // 业务逻辑里面已经用了 resAmt 做计算了， 这里做一下转译对应好字段即可==。不要纠结，因为两个金额最终都不会提交。
      const resAmt = mul(applySettleEqva || 0, eqvaSalary || 0);
      const projCode = projId
        ? (projectList.find(project => project.id === projId) || {}).code
        : undefined;
      const taskCode = taskId ? (taskList.find(task => task.id === taskId) || {}).code : undefined;

      yield put({
        type: 'updateState',
        payload: {
          projectList,
          resList,
          buList,
          formData: {
            ...infoData,
            // applySettleAmt,
            resAmt,
            projCode,
            taskCode,
          },
          taskList,
        },
      });
    },
    *fetchTaskInfo({ payload }, { call, put, select }) {
      const { status, response } = yield call(getInfo, { taskId: payload });
      if (status === 200) {
        const { resList, formData } = yield select(({ CommonCreate }) => CommonCreate);
        const resBuId = resList.find(res => res.id === response.datum.incomeResId).valSphd1;
        const taskInfo = pickAll(['settlePrice', 'eqvaSalary', 'incomeResId'], response.datum);
        const { settlePrice, eqvaSalary } = taskInfo;
        const { applySettleEqva } = formData;
        const applySettleAmt = mul(applySettleEqva || 0, settlePrice || 0);
        const resAmt = mul(applySettleEqva || 0, eqvaSalary || 0);
        yield put({
          type: 'updateForm',
          payload: {
            ...taskInfo,
            resBuId,
            taskId: payload,
            applySettleAmt,
            resAmt,
          },
        });
        return true;
      }
      return false;
    },
    *fetchTaskListByProjectId({ payload }, { call, put }) {
      const { status, response } = yield call(selectTaskByProjIdInEqua, payload);
      if (status === 200 && response) {
        yield put({
          type: 'updateState',
          payload: {
            taskList: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    *saveData({ payload }, { call, put }) {
      const { status, response } = yield call(putCommon, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto('/plat/intelStl/list');
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },
    *submitData({ payload }, { call, put }) {
      const { formData, taskId, remark } = payload;
      const { status, response } = yield call(putCommon, formData);
      if (status === 200 && response.ok) {
        if (taskId) {
          const result = yield call(doTaskTaskApply, taskId, remark);
          if (result.status === 200 && !result.response.code) {
            createMessage({ type: 'success', description: '提交成功' });
            closeThenGoto('/plat/intelStl/list');
          } else {
            createMessage({ type: 'error', description: '提交失败' });
          }
          return;
        }
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/plat/intelStl/list');
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    clean(state, action) {
      return {
        formData: {},
        projectList: [],
        taskList: [],
        resList: [],
        buList: [],
      };
    },
  },
};
