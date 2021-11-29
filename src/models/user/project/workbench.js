import router from 'umi/router';
import {
  findWorkbenchProjectActivityByProjId,
  findProjectActivityByProjId,
  findorkbenchTaskResByProjId,
  findorkbenchTaskResComprehensive,
  findWorkbenchProfile,
  findTotalDistedAndSettledEqvq,
} from '@/services/user/project/project';
import {
  saveTaskChange,
  startTaskChange,
  approvalTaskChange,
  findTaskChangeById,
} from '@/services/user/task/change';
import { closeThenGoto } from '@/layouts/routerControl';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectCapasetLevelBy } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import {
  findUserTaskById,
  saveUserTask,
  checkDist,
  getTaskNoById,
} from '@/services/user/task/task';
import { genFakeId, mul, sub } from '@/utils/mathUtils';
import { isNil } from 'lodash';

const handleTaskResData = function(cacheJson2, workbenchProjectActivities, projTaskRes) {
  const keysTemp = [
    'sumFlag',
    'actName',
    'actNo',
    'createTime',
    'createUserId',
    'days',
    'delFlag',
    'distedEqva',
    'endDate',
    'eqvaRate',
    'errorCode',
    'fromtmplFlag',
    'id',
    'milestoneFlag',
    'modifyTime',
    'modifyUserId',
    'phaseFlag',
    'planEqva',
    'projId',
    'remark',
    'sortNo',
    'startDate',
    'workbenchFlag',
    'totalDistedEqva',
    'totalSettledEqva',
  ];
  workbenchProjectActivities.forEach(act => {
    Object.keys(act).forEach(key => {
      if (keysTemp.indexOf(key) === -1) {
        delete act[key]; // eslint-disable-line
      }
    });
  });

  const cacheJson = cacheJson2;

  const sumRow = { sumFlag: 1, actNo: '', actName: '总计', id: -1 };

  projTaskRes.forEach(taskRes => {
    // const {projShId,
    //   resActivityList:{projActivityId,eqvaQty,settledEqva}
    // } = taskRes;

    const { projShId, resActivityList, taskStatus, taskId } = taskRes;
    let sumDistEqva = 0;
    let sumSettledEqva = 0;
    if (resActivityList && resActivityList.length) {
      resActivityList.forEach(resActivity => {
        const {
          id,
          projActivityId,
          eqvaQty,
          settledEqva,
          actStatus,
          actStatusName,
          planEqva,
        } = resActivity;
        if (!cacheJson[projActivityId]) {
          return;
        }
        sumDistEqva += !Number.isNaN(eqvaQty) ? eqvaQty : 0;
        sumSettledEqva += !Number.isNaN(settledEqva) ? settledEqva : 0;
        cacheJson[projActivityId]['res_' + projShId] = 'checked';
        cacheJson[projActivityId]['dist_eqva_' + projShId] = eqvaQty;
        cacheJson[projActivityId]['settled_eqva_' + projShId] = settledEqva;
        cacheJson[projActivityId]['act_status_' + projShId] = actStatus;
        cacheJson[projActivityId]['act_status_name_' + projShId] = actStatusName;
        cacheJson[projActivityId]['plan_eqva_' + projShId] = planEqva;
        cacheJson[projActivityId]['task_status_' + projShId] = taskStatus;
        cacheJson[projActivityId]['task_id_' + projShId] = taskId;
        cacheJson[projActivityId]['res_act_id_' + projShId] = id;
      });
    }
    sumRow['dist_eqva_' + projShId] = sumDistEqva;
    sumRow['settled_eqva_' + projShId] = sumSettledEqva;
  });

  const sumDays = workbenchProjectActivities.reduce(
    (total, projAct) => (total + !Number.isNaN(projAct.days) ? projAct.days : 0),
    0
  );

  const sumPlanEqva = workbenchProjectActivities.reduce(
    (total, projAct) => (total + !Number.isNaN(projAct.planEqva) ? projAct.planEqva : 0),
    0
  );
  sumRow.days = sumDays;
  sumRow.planEqva = sumPlanEqva;

  const lastRow = workbenchProjectActivities[workbenchProjectActivities.length - 1];
  if (lastRow.sumFlag === 1) {
    workbenchProjectActivities.splice(workbenchProjectActivities.length - 1, 1);
  }
  workbenchProjectActivities.push(sumRow);
};

export default {
  namespace: 'workbench',

  state: {
    projId: 0,
    offset: 0,
    limit: 10,
    profile: {},
    projActivityCol: [],
    isFold: false,
    actNoVisible: false,
    workbenchProjectActivities: [],
    projTaskRes: [],
    hiddenTaskRes: [],
    editTaskRes: [],
    projActCacheJson: {},
    projTaskResCacheJson: {},
    jobType2List: [], // 工种子类UDC联动数据
    capasetLevelList: [], // 复合能力级别列表
  },

  effects: {
    *queryWorkBenchProjectActivities({ payload }, { call, put, select }) {
      const { projId, refresh } = payload;
      const workbenchState = yield select(({ workbench }) => workbench);
      let { offset, limit } = workbenchState;
      if (refresh) {
        offset = 0;
        limit = 10;
      }

      const workbenchProjectActivities = [{ id: 0, actNo: '0000', actName: '任务包结算特殊活动' }];
      const specialTotalResponse = yield call(findTotalDistedAndSettledEqvq, projId);
      if (specialTotalResponse.response.ok) {
        const specialTotalData = specialTotalResponse.response.datum;
        if (specialTotalData) {
          workbenchProjectActivities[0].totalDistedEqva = specialTotalData.totalDistedEqva;
          workbenchProjectActivities[0].totalSettledEqva = specialTotalData.totalSettledEqva;
        }
      }

      console.log('请求工作台活动数据...');
      const {
        response: { ok, datum },
      } = yield call(findWorkbenchProjectActivityByProjId, projId);
      if (!ok) {
        return;
      }

      Array.prototype.push.apply(workbenchProjectActivities, datum);

      console.log('请求工作台项目资源任务包数据...');
      const response = yield call(findorkbenchTaskResByProjId, projId, offset, limit);
      if (!response) {
        return;
      }
      const projTaskRes = Array.isArray(response.response) ? response.response : [];

      const cacheJson = {};
      workbenchProjectActivities.forEach(act => {
        cacheJson[act.id] = act;
      });

      const projShIds = projTaskRes.map(res => res.projShId + '');
      const hiddenTaskResSet = Array.from(new Set(projShIds));

      const projTaskResCacheJson = {};
      projTaskRes.forEach(taskRes => {
        projTaskResCacheJson[taskRes.projShId] = taskRes;
      });

      handleTaskResData(cacheJson, workbenchProjectActivities, projTaskRes);

      const profileResponse = yield call(findWorkbenchProfile, projId);
      if (!response) {
        return;
      }
      const profile = profileResponse.response.datum;
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            ...payload,
            workbenchProjectActivities,
            projTaskRes,
            projActCacheJson: cacheJson,
            projTaskResCacheJson,
            profile,
            hiddenTaskRes: hiddenTaskResSet,
            offset,
            limit,
          },
        });
      }
    },

    // 查询项目资源任务
    *queryWorkBenchTaskRes({ payload }, { call, put }) {
      const { projId } = payload;
      console.log('请求工作台项目资源任务包数据...');
      const response = yield call(findorkbenchTaskResByProjId, projId);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            projTaskRes: response.response || [],
          },
        });
      }
    },

    // 根据工种获取工种子类的信息
    *updateJobType1({ payload }, { call, put, select }) {
      if (!payload) {
        return;
      }
      const { projShId, newValue } = payload;
      const state = yield select(({ workbench }) => workbench);
      const { projTaskResCacheJson, projTaskRes } = state;
      const taskRes = projTaskResCacheJson[projShId];
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:JOB_TYPE2',
        parentDefId: 'COM:JOB_TYPE1',
        parentVal: newValue,
      });
      taskRes.jobType2List = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          projTaskResCacheJson,
          projTaskRes,
        },
      });

      const data = { projShId, newValue, field: 'jobType1' };
      yield put({
        type: 'updateResTask',
        payload: {
          data,
        },
      });
    },

    // 工种 + 工种子类 -> 复合能力 注意这里是两个字段联动一个，不是直接上下级关系。
    *updateJobType2({ payload }, { call, put, select }) {
      if (!payload) {
        return;
      }
      const { projShId, newValue } = payload;
      const state = yield select(({ workbench }) => workbench);
      const { projTaskResCacheJson, projTaskRes } = state;
      const taskRes = projTaskResCacheJson[projShId];

      const { response } = yield call(selectCapasetLevelBy, {
        jobType1: taskRes.jobType1,
        jobType2: newValue,
      });
      taskRes.capasetLevelList = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          projTaskResCacheJson,
          projTaskRes,
        },
      });

      const data = { projShId, newValue, field: 'jobType2' };
      yield put({
        type: 'updateResTask',
        payload: {
          data,
        },
      });
    },

    /**
     * 修改资源活动
     * @param state
     * @param action
     * @returns {{}}
     */
    *handleTaskResEditCapasetLevel({ payload }, { call, put, select }) {
      const state = yield select(({ workbench }) => workbench);
      const { projShId } = payload;
      const { projTaskResCacheJson, projTaskRes } = state;
      const taskRes = projTaskResCacheJson[projShId];
      const { jobType1, jobType2 } = taskRes;

      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:JOB_TYPE2',
        parentDefId: 'COM:JOB_TYPE1',
        parentVal: jobType1,
      });
      taskRes.jobType2List = Array.isArray(response) ? response : [];

      const response2 = yield call(selectCapasetLevelBy, {
        jobType1,
        jobType2,
      });
      taskRes.capasetLevelList = Array.isArray(response2.response) ? response2.response : [];

      yield put({
        type: 'updateState',
        payload: {
          projTaskResCacheJson,
          projTaskRes,
        },
      });
    },

    /**
     * 资源任务保存
     * @param payload
     * @param call
     * @param put
     */
    *taskResSave({ payload }, { call, put, select }) {
      const { projShId } = payload;
      const workbenchState = yield select(({ workbench }) => workbench);
      const { projId, projActCacheJson, projTaskResCacheJson } = workbenchState;

      console.log('保存资源任务...............');
      const taskRes = projTaskResCacheJson[projShId];
      if (!taskRes.taskName) {
        createMessage({ type: 'warn', description: '请填写头部的任务包名称' });
        return;
      }
      if (!taskRes.acceptMethod) {
        createMessage({ type: 'warn', description: '请填写头部的验收方式' });
        return;
      }

      const { taskId, taskStatus } = taskRes;
      let { changeTaskId, changeTaskStatus } = taskRes;
      if (taskId) {
        if (taskStatus === 'CREATE') {
          // 任务包修改
          const { status, response } = yield call(findUserTaskById, { id: taskId });
          if (status === 100 || !response) {
            return;
          }
          const taskEntity = response.datum;
          taskEntity.jobType1 = taskRes.jobType1;
          taskEntity.jobType2 = taskRes.jobType2;
          taskEntity.capasetLeveldId = taskRes.capasetLevelId;

          taskEntity.acceptMethod = taskRes.acceptMethod;
          taskEntity.eqvaRatio = taskRes.eqvaRatio;

          taskEntity.planStartDate = taskRes.planStartDate;
          taskEntity.planEndDate = taskRes.planEndDate;

          taskEntity.taskName = taskRes.taskName;
          taskEntity.guaranteeRate = taskRes.guaranteeRate;
          taskEntity.allowTransferFlag = taskRes.allowTransferFlag;

          // 活动列表修改
          const { resActivityList } = taskEntity;
          const resActivityCache = {};
          resActivityList.forEach(resAct => {
            resActivityCache[resAct.projActivityId] = resAct;
          });

          // 拿到所有修改后的活动列表
          Object.keys(projActCacheJson).forEach(key => {
            const projAct = projActCacheJson[key];
            if (projAct.sumFlag) {
              return;
            }
            // key 项目活动id,projAct资源活动
            if (projAct['res_' + projShId]) {
              // 新列表包含资源活动
              if (resActivityCache[key]) {
                // 老列表包含资源活动,为修改动作
                if (
                  projAct['plan_eqva_' + projShId] !== undefined &&
                  projAct['plan_eqva_' + projShId] != null
                ) {
                  resActivityCache[key].eqvaQty = projAct['plan_eqva_' + projShId];
                }
              } else {
                // 老列表不包含资源活动,为新增资源活动动作
                const newResAct = {
                  actNo: projAct.actNo,
                  actName: projAct.actName,
                  eqvaQty: projAct['plan_eqva_' + projShId],
                  milestoneFlag: projAct.milestoneFlag,
                  taskId,
                  projActivityId: key,
                };
                resActivityList.push(newResAct);
              }
            } else {
              // 新列表不包含资源活动,需要删除老列表活动
              const index = resActivityList.indexOf(resActivityCache[key]);
              if (index > -1) {
                resActivityList.splice(index, 1);
              }
            }
          });

          // 保存任务包
          const saveResponse = yield call(saveUserTask, taskEntity);
          if (saveResponse.status === 100) {
            // 主动取消请求
            return;
          }
          if (saveResponse.response && saveResponse.response.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            yield put({
              type: 'refreshTaskRes',
              payload: { taskId, projShId },
            });
          } else {
            createMessage({ type: 'warn', description: saveResponse.response.reason });
          }
        } else if (taskStatus === 'IN PROCESS') {
          if (changeTaskStatus === 'APPROVED') {
            changeTaskId = undefined;
            changeTaskStatus = undefined;
          }
          // 查询是否有未结束的任务包变更
          if (!changeTaskId && !changeTaskStatus) {
            console.log('创建任务包变更...');
            // 没有未结束任务包变更,创建任务包变更
            // ===========创建任务包变更逻辑开始===============

            const taskChangeEntity = { taskId };
            const taskChangedtlEntities = [];

            const { status, response } = yield call(findUserTaskById, { id: taskId });
            if (status === 100 || !response) {
              return;
            }
            const taskEntity = response.datum;
            taskEntity.jobType1 = taskRes.jobType1;
            taskEntity.jobType2 = taskRes.jobType2;
            taskEntity.capasetLeveldId = taskRes.capasetLevelId;

            taskEntity.acceptMethod = taskRes.acceptMethod;
            taskEntity.eqvaRatio = taskRes.eqvaRatio;

            taskEntity.planStartDate = taskRes.planStartDate;
            taskEntity.planEndDate = taskRes.planEndDate;

            taskEntity.taskName = taskRes.taskName;
            taskEntity.guaranteeRate = taskRes.guaranteeRate;
            taskEntity.allowTransferFlag = taskRes.allowTransferFlag;

            // 活动列表修改
            const { resActivityList } = taskEntity;
            const resActivityCache = {};
            resActivityList.forEach(resAct => {
              resActivityCache[resAct.projActivityId] = resAct;
            });

            // 拿到所有修改后的活动列表
            Object.keys(projActCacheJson).forEach(key => {
              const projAct = projActCacheJson[key];
              if (projAct.sumFlag) {
                return;
              }
              // key 项目活动id,projAct资源活动
              if (projAct['res_' + projShId]) {
                // 新列表包含资源活动
                if (resActivityCache[key]) {
                  // 老列表包含资源活动,为修改动作

                  const resActivityCacheTemp = resActivityCache[key];
                  resActivityCacheTemp.planEqva =
                    projAct['plan_eqva_' + projShId] || projAct['dist_eqva_' + projShId];
                  const updateTaskChageDtl = {
                    resActivityId: resActivityCacheTemp.id,
                    oldEqva: resActivityCacheTemp.eqvaQty,
                    deltaEava: resActivityCacheTemp.planEqva - resActivityCacheTemp.eqvaQty,
                    newEqva: resActivityCacheTemp.planEqva,
                  };
                  taskChangedtlEntities.push(updateTaskChageDtl);
                } else {
                  // 老列表不包含资源活动,为新增资源活动动作
                  const genId = genFakeId(-1);
                  const newResAct = {
                    id: genId,
                    actNo: projAct.actNo,
                    actName: projAct.actName,
                    eqvaQty: 0,
                    planEqva: projAct['plan_eqva_' + projShId],
                    milestoneFlag: projAct.milestoneFlag,
                    taskId,
                    projActivityId: key,
                  };
                  resActivityList.push(newResAct);
                  const updateTaskChageDtl = {
                    resActivityId: genId,
                    oldEqva: 0,
                    deltaEava: projAct['plan_eqva_' + projShId],
                    newEqva: projAct['plan_eqva_' + projShId],
                  };
                  taskChangedtlEntities.push(updateTaskChageDtl);
                }
              } else {
                // 新列表不包含资源活动,需要删除老列表活动
                const index = resActivityList.indexOf(resActivityCache[key]);
                if (index > -1) {
                  resActivityList.splice(index, 1);
                }
              }
            });
            const addTaskChangeResponse = yield call(saveTaskChange, {
              taskEntity,
              taskChangeEntity,
              taskChangedtlEntities,
            });
            if (addTaskChangeResponse.status === 100) {
              // 主动取消请求
              return;
            }
            if (addTaskChangeResponse.response && addTaskChangeResponse.response.ok) {
              const newTaskId = addTaskChangeResponse.response.datum.taskEntity.id;
              createMessage({ type: 'success', description: '保存成功' });
              yield put({
                type: 'refreshTaskRes',
                payload: { taskId: newTaskId, projShId },
              });
            } else {
              createMessage({ type: 'warn', description: addTaskChangeResponse.response.reason });
            }

            // ===========创建任务包变更逻辑结束===============
          } else if (changeTaskId && !changeTaskStatus) {
            // 有未派发的任务包变更,修改任务包变更
            // ===========修改任务包变更逻辑开始===============
            const taskChangeEntity = { taskId, id: changeTaskId };
            const taskChangedtlEntities = [];

            const { status, response } = yield call(findUserTaskById, { id: taskId });
            if (status === 100 || !response) {
              return;
            }
            const taskEntity = response.datum;
            taskEntity.jobType1 = taskRes.jobType1;
            taskEntity.jobType2 = taskRes.jobType2;
            taskEntity.capasetLeveldId = taskRes.capasetLevelId;

            taskEntity.acceptMethod = taskRes.acceptMethod;
            taskEntity.eqvaRatio = taskRes.eqvaRatio;

            taskEntity.planStartDate = taskRes.planStartDate;
            taskEntity.planEndDate = taskRes.planEndDate;

            taskEntity.taskName = taskRes.taskName;
            taskEntity.guaranteeRate = taskRes.guaranteeRate;
            taskEntity.allowTransferFlag = taskRes.allowTransferFlag;

            // 活动列表修改
            const { resActivityList } = taskEntity;
            const resActivityCache = {};
            resActivityList.forEach(resAct => {
              resActivityCache[resAct.projActivityId] = resAct;
            });

            // 拿到所有修改后的活动列表
            Object.keys(projActCacheJson).forEach(key => {
              const projAct = projActCacheJson[key];
              if (projAct.sumFlag) {
                return;
              }
              // key 项目活动id,projAct资源活动
              if (projAct['res_' + projShId]) {
                // 新列表包含资源活动
                if (resActivityCache[key]) {
                  // 老列表包含资源活动,为修改动作

                  const resActivityCacheTemp = resActivityCache[key];
                  resActivityCacheTemp.planEqva =
                    projAct['plan_eqva_' + projShId] || projAct['dist_eqva_' + projShId];
                  const updateTaskChageDtl = {
                    resActivityId: resActivityCacheTemp.id,
                    oldEqva: resActivityCacheTemp.eqvaQty,
                    deltaEava: resActivityCacheTemp.planEqva - resActivityCacheTemp.eqvaQty,
                    newEqva: resActivityCacheTemp.planEqva,
                  };
                  taskChangedtlEntities.push(updateTaskChageDtl);
                } else {
                  // 老列表不包含资源活动,为新增资源活动动作
                  const genId = genFakeId(-1);
                  const newResAct = {
                    id: genId,
                    actNo: projAct.actNo,
                    actName: projAct.actName,
                    eqvaQty: 0,
                    planEqva: projAct['plan_eqva_' + projShId],
                    milestoneFlag: projAct.milestoneFlag,
                    taskId,
                    projActivityId: key,
                  };
                  resActivityList.push(newResAct);
                  const updateTaskChageDtl = {
                    resActivityId: genId,
                    oldEqva: 0,
                    deltaEava: projAct['plan_eqva_' + projShId],
                    newEqva: projAct['plan_eqva_' + projShId],
                  };
                  taskChangedtlEntities.push(updateTaskChageDtl);
                }
              } else {
                // 新列表不包含资源活动,需要删除老列表活动
                const index = resActivityList.indexOf(resActivityCache[key]);
                if (index > -1) {
                  resActivityList.splice(index, 1);
                }
              }
            });

            // 处理修改任务包编辑的逻辑,添加上id
            const findTaskChangeByIdResponse = yield call(findTaskChangeById, changeTaskId);
            if (findTaskChangeByIdResponse.status === 100) {
              // 主动取消请求
              return;
            }
            if (findTaskChangeByIdResponse.response && findTaskChangeByIdResponse.response.ok) {
              const taskChangeAllView = findTaskChangeByIdResponse.response.datum;
              const changeDtls = taskChangeAllView.taskChangedtlViews || [];

              const taskChangedtlEntitiesCache = {};
              taskChangedtlEntities.forEach(taskChangedtlEntitie => {
                taskChangedtlEntitiesCache[
                  taskChangedtlEntitie.resActivityId
                ] = taskChangedtlEntitie;
              });
              changeDtls.forEach(changeDtl => {
                taskChangedtlEntitiesCache[changeDtl.resActivityId].id = changeDtl.id;
              });
            } else {
              createMessage({ type: 'warn', description: '保存失败' });
              return;
            }

            // 保存任务包变更
            const addTaskChangeResponse = yield call(saveTaskChange, {
              taskEntity,
              taskChangeEntity,
              taskChangedtlEntities,
            });
            if (addTaskChangeResponse.status === 100) {
              // 主动取消请求
            }
            if (addTaskChangeResponse.response && addTaskChangeResponse.response.ok) {
              const newTaskId = addTaskChangeResponse.response.datum.taskEntity.id;
              createMessage({ type: 'success', description: '保存成功' });
              yield put({
                type: 'refreshTaskRes',
                payload: { taskId: newTaskId, projShId },
              });
            } else {
              createMessage({ type: 'warn', description: addTaskChangeResponse.response.reason });
            }

            // ===========修改任务包变更逻辑结束===============
          } else {
            // 有未派发的任务包变更,不可操作
            createMessage({ type: 'warn', description: '当前任务包正在变更中,不可操作' });
          }
        } else {
          // 当前任务包状态不可操作
          createMessage({ type: 'warn', description: '当前任务包状态,不可操作' });
        }
      } else {
        // 新建任务包
        // ================新建任务包逻辑开始=============
        const taskEntity = {};
        taskEntity.jobType1 = taskRes.jobType1;
        taskEntity.jobType2 = taskRes.jobType2;
        taskEntity.capasetLeveldId = taskRes.capasetLevelId;
        taskEntity.receiverResId = taskRes.receiverResId;
        taskEntity.shId = projShId;
        taskEntity.reasonType = '01';
        taskEntity.reasonId = projId;
        // taskEntity.expenseBuId = '01';

        taskEntity.acceptMethod = taskRes.acceptMethod;
        taskEntity.eqvaRatio = taskRes.eqvaRatio;

        taskEntity.planStartDate = taskRes.planStartDate;
        taskEntity.planEndDate = taskRes.planEndDate;

        taskEntity.taskName = taskRes.taskName;
        taskEntity.taskStatus = 'CREATE';

        taskEntity.guaranteeRate = taskRes.guaranteeRate || 0;
        taskEntity.allowTransferFlag = taskRes.allowTransferFlag || 0;

        // 默认不自定义BU结算价
        taskEntity.settlePriceFlag = 0;

        // 活动列表修改
        const resActivityList = [];

        // 拿到所有修改后的活动列表
        Object.keys(projActCacheJson).forEach(key => {
          const projAct = projActCacheJson[key];
          if (projAct.sumFlag) {
            return;
          }
          // key 项目活动id,projAct资源活动
          if (projAct['res_' + projShId]) {
            // 新列表包含资源活动

            // 新增资源活动动作
            const newResAct = {
              actNo: projAct.actNo,
              actName: projAct.actName,
              eqvaQty: projAct['plan_eqva_' + projShId],
              milestoneFlag: projAct.milestoneFlag,
              taskId,
              projActivityId: key,
            };
            resActivityList.push(newResAct);
          }
        });
        taskEntity.resActivityList = resActivityList;

        // 保存任务包
        const saveResponse = yield call(saveUserTask, taskEntity);
        if (saveResponse.status === 100) {
          // 主动取消请求
          return;
        }
        if (saveResponse.response && saveResponse.response.ok) {
          const newTaskId = saveResponse.response.datum.id;
          createMessage({ type: 'success', description: '新增成功' });
          yield put({
            type: 'refreshTaskRes',
            payload: { taskId: newTaskId, projShId },
          });
        } else {
          createMessage({ type: 'warn', description: saveResponse.response.reason });
        }

        // ================新建任务包逻辑结束============
      }
    },

    /**
     * 重新拉取某个资源的任务包信息
     * @param payload
     * @param call
     * @param put
     * @param select
     */
    *refreshTaskRes({ payload }, { call, put, select }) {
      const { taskId, projShId } = payload;
      const workbenchState = yield select(({ workbench }) => workbench);
      const {
        projId,
        projActCacheJson,
        projTaskResCacheJson,
        workbenchProjectActivities,
        projTaskRes,
        editTaskRes,
      } = workbenchState;
      const taskRes = projTaskResCacheJson[projShId];
      let taskNo = '';
      if (!isNil(taskId)) {
        // 如果传了taskId就查询taskNo
        const resp = yield call(getTaskNoById, taskId);
        taskNo = resp && resp.response;
      }
      if (isNil(taskId) || taskNo === 'TK000') {
        // 如果 taskId=0 ！taskId=true
        // 无任务的情况
        taskRes.taskName = '无任务';
        taskRes.resActivityList = [];
      }
      if (taskId && taskNo !== 'TK000') {
        // 有任务包ID,拉取具体的任务包信息
        const { status, response } = yield call(findUserTaskById, { id: taskId });
        if (status === 100 || !response) {
          return;
        }
        const taskEntity = response.datum;
        taskRes.taskName = taskEntity.taskName;
        taskRes.taskId = taskId;
        taskRes.capasetLevelId = taskEntity.capasetLeveldId;
        taskRes.capasetLevelName = taskEntity.capasetLevelName;
        taskRes.jobType1 = taskEntity.jobType1;
        taskRes.jobType2 = taskEntity.jobType2;
        taskRes.capasetLevelRatio = taskEntity.capasetLevelRatio;

        taskRes.taskNo = taskEntity.taskNo;
        taskRes.acceptMethod = taskEntity.acceptMethod;
        taskRes.acceptMethodName = taskEntity.acceptMethodName;
        taskRes.eqvaRatio = taskEntity.eqvaRatio;
        taskRes.planStartDate = taskEntity.planStartDate;
        taskRes.planEndDate = taskEntity.planEndDate;
        taskRes.eqvaQty = taskEntity.eqvaQty;
        taskRes.settledEqva = taskEntity.settledEqva;
        taskRes.guaranteeRate = taskEntity.guaranteeRate;
        taskRes.taskStatus = taskEntity.taskStatus;
        taskRes.taskStatusName = taskEntity.taskStatusName;
        taskRes.allowTransferFlag = taskEntity.allowTransferFlag;
        taskRes.amt = taskEntity.amt;
        taskRes.resActivityList = taskEntity.resActivityList;
        taskRes.changeTaskId = taskEntity.changeTaskId;
        taskRes.changeTaskStatus = taskEntity.changeTaskStatus;
      }
      if (taskId && taskId === '-1') {
        // 拉取资源的综合任务包信息

        const { response } = yield call(findorkbenchTaskResComprehensive, projId, projShId);
        const index = projTaskRes.indexOf(taskRes);
        if (index > -1) {
          projTaskRes.splice(index, 1, response);
          projTaskResCacheJson[projShId] = response;
        }
      }
      // 去除资源的编辑状态
      const index = editTaskRes.indexOf(projShId);
      if (index > -1) {
        editTaskRes.splice(index, 1);
      }
      handleTaskResData(projActCacheJson, workbenchProjectActivities, projTaskRes);
      yield put({
        type: 'updateState',
        payload: {
          workbenchProjectActivities,
          projTaskRes,
          projActCacheJson,
          projTaskResCacheJson,
          editTaskRes,
        },
      });
    },

    /**
     * 加载更多资源
     * @param payload
     * @param call
     * @param put
     * @param select
     */
    *loadMore({ payload }, { call, put, select }) {
      const workbenchState = yield select(({ workbench }) => workbench);
      const {
        projId,
        offset,
        limit,
        workbenchProjectActivities,
        projTaskRes,
        projActCacheJson,
        hiddenTaskRes,
      } = workbenchState;
      const response = yield call(findorkbenchTaskResByProjId, projId, offset + limit, limit);
      if (!response) {
        return;
      }
      const moreProjTaskRes = response.response || [];
      if (moreProjTaskRes.length <= 0) {
        createMessage({ type: 'warn', description: '已经没有更多的资源啦...' });
        return;
      }
      const projShIds = moreProjTaskRes.map(res => res.projShId + '');
      const hiddenTaskResSet = Array.from(new Set(projShIds));
      Array.prototype.push.apply(hiddenTaskRes, hiddenTaskResSet);
      Array.prototype.push.apply(projTaskRes, moreProjTaskRes);
      const projTaskResCacheJson = {};
      projTaskRes.forEach(taskRes => {
        projTaskResCacheJson[taskRes.projShId] = taskRes;
      });

      handleTaskResData(projActCacheJson, workbenchProjectActivities, projTaskRes);

      yield put({
        type: 'updateState',
        payload: {
          workbenchProjectActivities,
          projTaskRes,
          projActCacheJson,
          projTaskResCacheJson,
          offset: offset + limit,
          hiddenTaskRes,
        },
      });
    },

    // 新建状态任务包派发
    *taskDist({ payload }, { call, put }) {
      const { status, response } = yield call(checkDist, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        router.push(`/user/distribute/create?taskId=${payload.id}`);
      } else {
        createMessage({ type: 'error', description: response.reason || '不满足派发条件' });
      }
    },

    // 任务包变更派发
    *taskChangeDist({ payload }, { call, put }) {
      const result = yield call(startTaskChange, payload.changeTaskId); // changeId
      if (result.status === 200) {
        createMessage({ type: 'success', description: '操作成功' });
      } else {
        createMessage({ type: 'error', description: '流程提交失败,请联系管理员' });
        return;
      }
      router.push(`/user/flow/process`);
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    /**
     * 添加或者删除资源活动
     * @param state
     * @param action
     * @returns {{}}
     */
    addOrRemoveResAct(state, action) {
      const {
        payload: { checked, projShId, projActId, taskStatus, taskId },
      } = action;
      const { projActCacheJson } = state;
      if (!checked) {
        projActCacheJson[projActId]['res_' + projShId] = 'checked';
        projActCacheJson[projActId]['dist_eqva_' + projShId] = 0;
        projActCacheJson[projActId]['settled_eqva_' + projShId] = 0;
        projActCacheJson[projActId]['act_status_name_' + projShId] = '未开始';
        projActCacheJson[projActId]['days_' + projShId] = 0;
        projActCacheJson[projActId]['plan_eqva_' + projShId] = 0;
        projActCacheJson[projActId]['task_status_' + projShId] = taskStatus;
        projActCacheJson[projActId]['task_id_' + projShId] = taskId;
        projActCacheJson[projActId]['res_act_id_' + projShId] = undefined;
      } else {
        projActCacheJson[projActId]['res_' + projShId] = undefined;
        projActCacheJson[projActId]['dist_eqva_' + projShId] = undefined;
        projActCacheJson[projActId]['settled_eqva_' + projShId] = undefined;
        projActCacheJson[projActId]['act_status_name_' + projShId] = undefined;
        projActCacheJson[projActId]['days_' + projShId] = undefined;
        projActCacheJson[projActId]['plan_eqva_' + projShId] = undefined;
        projActCacheJson[projActId]['task_status_' + projShId] = undefined;
        projActCacheJson[projActId]['task_id_' + projShId] = undefined;
        projActCacheJson[projActId]['res_act_id_' + projShId] = undefined;
      }
      return {
        ...state,
      };
    },

    /**
     * 修改资源活动
     * @param state
     * @param action
     * @returns {{}}
     */
    updateResAct(state, action) {
      const {
        payload: {
          data: { projShId, projActId, newValue, field },
        },
      } = action;
      const { projActCacheJson } = state;
      if (field) {
        const { projTaskResCacheJson } = state;
        const ratio = projTaskResCacheJson[projShId].eqvaRatio;

        projActCacheJson[projActId]['plan_eqva_' + projShId] = newValue * ratio;
      }
      projActCacheJson[projActId][field + '_' + projShId] = newValue;

      return {
        ...state,
      };
    },

    /**
     * 修改资源任务
     * @param state
     * @param action
     * @returns {{}}
     */
    updateResTask(state, action) {
      const {
        payload: {
          data: { projShId, newValue, field },
        },
      } = action;
      const { projTaskResCacheJson } = state;
      projTaskResCacheJson[projShId][field] = newValue;

      return {
        ...state,
      };
    },
  },
};
