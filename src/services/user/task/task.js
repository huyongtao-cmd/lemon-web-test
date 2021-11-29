import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { userMultiColSelect, task, distribute } = api.user;
const { doTask } = api.bpm;
const {
  userTasks,
  userTask,
  userTaskSave,
  userTasksDel,
  // 流程
  taskReopen,
  taskPend,
  // 查询列表
  userTaskLevelds,
  userTaskRess,
  userTaskProjs,
  userTaskBus,
  userTaskPreSales,
  userTaskPorjActs,
  userTaskApply,
  selectBuByResId,
  userTaskApplyById,
  userTaskApplySubmit,
  capasetDefault,
  userTaskSettle,
  tasksClose,
  selectActivityById,
  procActivityFinishApply,

  taskTmplCreateUri,
  taskTmplModifyUri,
  taskTmplDetailUri,
  taskTmplListPagingUri,
  taskTmplLogicalDeleteUri,

  taskMultiCreateUri,
  taskMultiModifyUri,
  taskMultiDetailUri,
  taskMultiListPagingUri,
  taskMultiLogicalDeleteUri,
  findTaskCompByCompId,
  doQueryByLogIds,
  doUpdateProjectByLogIds,
  findIdByTaskNo,
  getNoById,
} = task;
const { checkDistribute } = distribute;

export async function queryUserTasks(params) {
  return request.get(toQs(userTasks, params));
}

export async function findUserTaskById({ id }) {
  return request.get(toUrl(userTask, { id }));
}

export async function saveUserTask(params) {
  return request.put(userTaskSave, {
    body: params,
  });
}

export async function deleteUserTasksByIds({ ids }) {
  return request.patch(toUrl(userTasksDel, { ids: ids.join(',') }));
}

export async function closeTasks({ id }) {
  return request.patch(toUrl(tasksClose, { id }));
}

// 流程 - 变更
// export async function changeTask({ id }) {}

// 流程 - 派发
// export async function distributeTask({ id }) {}

// 流程 - 关闭
// export async function closeTask() {}

// 流程 - 暂挂
export async function cancelTask({ id, stat }) {
  return request.patch(toUrl(taskPend, { id, stat }));
}

// 流程 - 重启
export async function reopenTask({ id }) {
  return request.patch(toUrl(taskReopen, { id }));
}

// 查询列表

// 复合能力
export async function queryCapasetLeveldList(params) {
  return request.get(toQs(userTaskLevelds, params));
}

// 资源
export async function queryResList(params) {
  return request.get(toQs(userTaskRess, params));
}

// 人员数据 下拉
export async function selectUsers() {
  return request.get(userMultiColSelect);
}

// 事由项目
export async function queryReasonList(params) {
  return request.get(toQs(userTaskProjs, params));
}

// 事由BU
export async function queryBuList(params) {
  return request.get(toQs(userTaskBus, params));
}

// 售前
export async function queryPreSaleList(params) {
  return request.get(toQs(userTaskPreSales, params));
}

// 表格 - 项目活动
export async function queryActList(id) {
  return request.get(toUrl(userTaskPorjActs, { id }));
}

// 保存任务包申请
export async function saveTaskApply(params) {
  return request.put(userTaskApply, { body: params });
}

// 根据选择的资源获取资源人BU
export async function selectBuByResIdUri(resId) {
  return request.get(toUrl(selectBuByResId, resId));
}

// 任务包申请详情
export async function queryTaskApplyById(id) {
  return request.get(toUrl(userTaskApplyById, { id }));
}

// 提交派发流程
export async function submitTaskApply(id) {
  return request.post(toUrl(userTaskApplySubmit, { id }));
}

// 再次提交派发流程
export async function doTaskTaskApply(id, remark) {
  return request.post(toUrl(doTask, { id }), {
    body: { result: 'APPLIED', remark },
  });
}

// 获取当前登录人的默认能力
export async function qetCapasetDefault() {
  return request.get(capasetDefault);
}

export async function queryTaskSettle(params) {
  return request.get(toQs(userTaskSettle, params));
}

// 判断是否可以派发
export async function checkDist(params) {
  return request.get(toQs(checkDistribute, params));
}

// 根据资源活动id查询
export async function queryActivityById(params) {
  return request.get(toUrl(selectActivityById, params));
}

// 资源活动完工申请流程
export async function saveprocActivityFinishApply(params) {
  return request.post(procActivityFinishApply, { body: params });
}

// 任务模板
export async function taskTmplCreate(param) {
  return request.post(taskTmplCreateUri, { body: param });
}
export async function taskTmplModify(param) {
  return request.put(taskTmplModifyUri, { body: param });
}
export async function taskTmplDetail(param) {
  return request.get(toUrl(taskTmplDetailUri, param));
}
export async function taskTmplListPaging(param) {
  return request.get(toQs(taskTmplListPagingUri, param));
}
export async function taskTmplLogicalDelete(param) {
  return request.patch(toQs(taskTmplLogicalDeleteUri, param));
}

// 指派
export async function taskMultiCreate(param) {
  return request.post(taskMultiCreateUri, { body: param });
}
export async function taskMultiModify(param) {
  return request.put(taskMultiModifyUri, { body: param });
}
export async function taskMultiDetail(param) {
  return request.get(toUrl(taskMultiDetailUri, param));
}
export async function taskMultiListPaging(param) {
  return request.get(toQs(taskMultiListPagingUri, param));
}
export async function taskMultiLogicalDelete(param) {
  return request.patch(toQs(taskMultiLogicalDeleteUri, param));
}
export async function findTaskComp(compId) {
  return request.get(toUrl(findTaskCompByCompId, { compId }));
}
export async function queryByLogIds(ids) {
  return request.get(toUrl(doQueryByLogIds, { ids }));
}
export async function updateProjectByLogIds(ids) {
  return request.get(toUrl(doUpdateProjectByLogIds, { ids }));
}
export async function findIdByNo(taskNo) {
  return request.get(toUrl(findIdByTaskNo, { taskNo }));
}

export async function getTaskNoById(taskId) {
  return request.get(toUrl(getNoById, { taskId }));
}
