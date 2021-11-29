import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const {
  saveFlow,
  getFlowList,
  deleteFlow,
  getFlow,
  getBusConfig,
  saveBusConfig,
  getResolveField,
  getBusinessEvent,
  saveEventInfo,
  deleteEventInfo,
  getEventInfo,
  selectFlowRole,
  getLineVarInfo,
  getLineVarInfoNew,
  getFlowModel,
  saveNodeConfig,
  getLatestProcess,
  getBusinessBtn,
  changeAutoAppr,
} = api.flowUpgrade;

// 保存工作流
export async function saveFlowHandle(params) {
  return request.post(saveFlow, {
    body: params,
  });
}
// 获取工作流
export async function getFlowHandle(param) {
  return request.get(toQs(getFlowList, param));
}

// 删除工作流
export async function unloadFlowhandel(id) {
  return request.delete(toUrl(deleteFlow, { id }));
}

// 获取单个工作流信息
export async function getFlowInfoHandle(param) {
  return request.get(toQs(getFlow, param));
}

// 获取单个业务配置
export async function getBusConfigHandle(defKey) {
  return request.get(toUrl(getBusConfig, { defKey }));
}

// 保存单个业务配置
export async function saveBusConfigHandle(params) {
  return request.post(saveBusConfig, {
    body: params,
  });
}

// 获取业务字段
export async function getResolveFieldFn(params) {
  return request.get(
    toQs(toUrl(getResolveField, { defKey: params.defKey }), { refresh: params.refresh })
  );
}

// 获取业务事件
export async function getBusinessEventFn(params) {
  return request.get(
    toQs(toUrl(getBusinessEvent, { defKey: params.defKey }), { status: params.status })
  );
}

// 保存业务事件
export async function saveEventInfoHandle(params) {
  return request.post(saveEventInfo, {
    body: params,
  });
}

// 获取单个业务事件
export async function getSingleEventHandle(id) {
  return request.get(toUrl(getEventInfo, { id }));
}

// 删除业务事件
export async function deleteEventHandle(ids) {
  return request.patch(toUrl(deleteEventInfo, { ids }));
}

// 选择角色
export async function selectFlowRoleFn(params) {
  return request.post(
    toUrl(selectFlowRole, { defKey: params.defKey, taskKey: params.taskKey, id: params.id })
  );
}

// 获取线的配置
export async function getLineVarInfoFn(params) {
  return request.get(toUrl(getLineVarInfo, { defKey: params.defKey, taskKey: params.taskKey }));
}
// 获取线的配置新
export async function getLineVarInfoNewFn(params) {
  return request.get(toUrl(getLineVarInfoNew, { defKey: params.defKey, taskKey: params.taskKey }));
}

// 获取节点名称
export async function getFlowModelHandle(defId) {
  return request.get(toUrl(getFlowModel, { defId }));
}

// 保存节点配置
export async function saveNodeConfigHandle(defKey, params) {
  return request.post(saveNodeConfig.replace(':defKey', defKey), {
    body: params,
  });
}

// 获取最新流程信息
export async function getLatestProcessHandle(defId) {
  return request.get(toUrl(getLatestProcess, { defId }));
}

// 获取流程节点按钮组信息
export async function getBusinessBtnHandle(defKey, taskKey) {
  return request.get(toUrl(getBusinessBtn, { defKey, taskKey }));
}

// 修改节点的自动审批状态
export async function changeAutoApprove(payload) {
  return request.patch(toUrl(changeAutoAppr, payload));
}
