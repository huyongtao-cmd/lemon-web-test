import api from '@/api';
import { toUrl, toQs } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  // getConfig,
  // config,
  configById,
  getFlowInfo,
  getMutiFlowInfo,
} = api.bpmn;
const { doTask, cancel, chApprover, chAllApprover, changeAssigneeByTaskId, submitOrAppr } = api.bpm;

// async function getTaskKey(taskId) {
//   return request.get(toUrl(getConfig, { id: taskId }));
// }

// async function getViewConfig(taskKey) {
//   return request.get(toUrl(config, { id: taskKey }));
// }

// /**
//  * tag :: remark
//  * getConfig 为临时添加接口，用于 taskId -> taskKey
//  * config 为拉取 viewConf 的接口， 用于通过 taskKey 拉对应 json
//  *
//  * 以后 config 接口会改善，可以直接通过 taskId 拉取对应 json，寻找 taskKey 由后台自己完成，不需要调两次
//  * 到时候，上面两个方法就可以干掉了，直接做请求即可
//  */
// export async function getViewConf(id) {
//   const data = await getTaskKey(id);
//   const { status, response } = data;
//   if (status === 200) return getViewConfig(response);
//   return Promise.resolve(data);
// }

// 接口合并，原来两步走变为现在一步走, 看上面注释哈:)
export async function getViewConf(id) {
  return request.get(toUrl(configById, { id }));
}

export async function getFlowInfoByTaskInfo(params) {
  return request.get(toQs(getFlowInfo, params));
}

export async function getMutiFlowInfoByTaskInfo(params) {
  return request.get(toQs(getMutiFlowInfo, params));
}

// 推送流程节点
export async function pushFlowTask(taskId, params) {
  return request.post(toUrl(doTask, { id: taskId }), {
    body: params,
  });
}

export async function cancelFlow(id) {
  return request.delete(toUrl(cancel, { id }));
}

export async function changeApproverRq(id) {
  const { idList, changeApprover } = id.newParams;
  return request.patch(toUrl(chApprover, { procIds: idList, userIds: changeApprover.join(',') }));
}
// 根据节点id变更审批人
export async function changeAssigneeByTaskIdRq(taskId) {
  const { idList, changeApproverByTaskId, changeApprover } = taskId.newParams;
  return request.patch(
    toUrl(changeAssigneeByTaskId, { taskIds: idList, userIds: changeApprover.join(',') })
  );
}

export async function changeAllApproverRq(id) {
  const { changeApprover, lastApprover } = id.newParams;
  return request.patch(toUrl(chAllApprover, { userIdF: lastApprover, userIdT: changeApprover }));
}

export async function submitOrApprRq(param) {
  return request.post(submitOrAppr, { body: param });
}
