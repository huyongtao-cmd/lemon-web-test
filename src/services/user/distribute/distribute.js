import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  userMultiColSelect,
  validUserMultiColSelect,
  distribute,
  task: { taskDist },
} = api.user;
const {
  findDist,
  distributes,
  responses,
  saveDist,
  submitDist,
  saveBroadcast,
  distResponse,
  myResponses,
  cancelBroadcast,
  rejectResponse,
  deleteIds,
  broadcast,
  invite,
  broadcastInterested,
  broadcastUninterested,
  inviteInterested,
  inviteNotApplicable,
  updateDistStatus,
  procCancel,
} = distribute;
const { doTask, cancel } = api.bpm;

// 派发列表查询
export async function queryDistributes(params) {
  return request.get(toQs(distributes, params));
}

// 我接收的响应列表查询  distNo
export async function queryResponses(params) {
  return request.get(toQs(responses, params));
}

// 派发单条信息查询
export async function findDistribute(id) {
  return request.get(toUrl(findDist, { id }));
}

// 保存派发相关信息详情
export async function saveDistribute(params) {
  return request.put(saveDist, { body: params });
}

// 提交派发流程
export async function submitDistribute(id) {
  return request.post(toUrl(submitDist, { id }));
}

// 删除派发流程
export async function delectDistribute(params) {
  return request.delete(toUrl(cancel, { id: params.apprId }));
}

// 再次提交派发流程
export async function doTaskDistribute(params) {
  return request.post(toUrl(doTask, { id: params.apprId }), {
    body: { result: 'APPROVED', remark: null },
  });
}

// 保存并广播派发信息
export async function saveDistBroadcast(params) {
  return request.put(saveBroadcast, { body: params });
}

// 人员数据 下拉
export async function selectUsers() {
  return request.get(userMultiColSelect);
}
// 有效人员数据 下拉
export async function selectValidUsers() {
  return request.get(validUserMultiColSelect);
}

// 获得派发详情的 响应列表
export async function queryDistResponse(distId) {
  return request.get(toUrl(distResponse, { distId }));
}

// 我响应的广播列表查询  distNo disterResId
export async function queryMyResponses(params) {
  return request.get(toQs(myResponses, params));
}

// 取消广播
export async function cancelDistBroadcast(distId) {
  return request.delete(toUrl(cancelBroadcast, { distId }));
}

// 谢绝响应
export async function rejectDistResponse(ids) {
  return request.patch(toUrl(rejectResponse, { ids: ids.join(',') }));
}

// 批量删除派发
export async function deleteDistByIds(ids) {
  return request.patch(toUrl(deleteIds, { ids: ids.join(',') }));
}

// 更改任务信息的状态为派发中
export async function distributeTask(id) {
  return request.patch(toUrl(taskDist, { id }));
}

// 广播任务看板
export async function queryBroadcast(params) {
  return request.get(toQs(broadcast, params));
}

// 我收到的邀请
export async function queryInvite(params) {
  return request.get(toQs(invite, params));
}

// 广播看板 -- 感兴趣
export async function interestedOnBroadcast(params) {
  return request.patch(broadcastInterested, { body: params });
}
// 广播看板 -- 不感兴趣
export async function unInterestedOnBroadcast(params) {
  return request.patch(broadcastUninterested, { body: params });
}
// 任务邀请响应 -- 感兴趣
export async function interested(params) {
  return request.patch(toUrl(inviteInterested, { id: params.id }), { body: params });
}
// 任务邀请响应 -- 不适合
export async function notApplicable(params) {
  return request.patch(toUrl(inviteNotApplicable, { id: params.id }), { body: params });
}

// 改变响应状态
export async function changeDistStatus(params) {
  return request.post(toUrl(updateDistStatus, { id: params.id }), {
    body: params.value,
  });
}
