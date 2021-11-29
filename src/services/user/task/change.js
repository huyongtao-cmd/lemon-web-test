import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { task } = api.user;
const { doTask } = api.bpm;
const { taskChangeStart, taskChange, taskChangeDetails, taskChangeHistory } = task;

// 保存任务包变更
export async function saveTaskChange(params) {
  return request.put(taskChange, {
    body: params,
  });
}

// 提交派发流程
export async function startTaskChange(id) {
  return request.post(toUrl(taskChangeStart, { id }));
}

// 再次提交派发流程
export async function approvalTaskChange(params) {
  return request.post(toUrl(doTask, { id: params.apprId }), {
    body: { result: 'APPROVED', remark: null },
  });
}

// 查询任务包变更页面详情
export async function findTaskChangeById(changeId) {
  return request.get(toQs(taskChange, { changeId }));
}

// 查询任务包变更历史列表
export async function findTaskChangeHistory(taskId) {
  return request.get(toQs(taskChangeHistory, { taskId }));
}

// 根据changeId查询变更明细列表
export async function findTaskChangeDetails(changeId) {
  return request.get(toUrl(taskChangeDetails, { changeId }));
}
