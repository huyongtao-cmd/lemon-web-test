import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  sendMessageByNoUri,
  messageConfigListUri,
  messageConfigInsertUri,
  messageConfigUpdateUri,
  messageConfigDetailUri,
  messageConfigDeleteUri,
  queryMessageTagUri,
  messageTagListUri,
  messageTagInsertUri,
  messageTagDeleteUri,
  messageTagDetailUri,
  messageShieldingListUri,
  messageShieldingInsertUri,
  messageShieldingDeleteUri,
  messageShieldingDetailUri,
  queryRelaeseSourceUri,
  queryRolesUri,
} = api.sys.system;

export async function sendMessageByNo(param) {
  return request.get(toQs(sendMessageByNoUri, param));
}
// 消息通知配置列表查询
export async function messageConfigListUriRq(params) {
  return request.get(toQs(messageConfigListUri, params));
}
// 新增消息通知配置
export async function messageConfigInsertUriRq(params) {
  return request.post(messageConfigInsertUri, {
    body: params,
  });
}
// 修改消息通知配置
export async function messageConfigUpdateUriRq(params) {
  return request.put(messageConfigUpdateUri, {
    body: params,
  });
}
// 消息通知配置详情
export async function messageConfigDetailUriRq(id) {
  return request.get(toUrl(messageConfigDetailUri, id));
}
// 删除消息通知配置
export async function messageConfigDeleteUriRq(payload) {
  return request.patch(toUrl(messageConfigDeleteUri, payload));
}
// 查询消息标签-用于消息配置
export async function queryMessageTagUriRq(params) {
  return request.get(toQs(queryMessageTagUri, params));
}

// 消息通知标签配置列表查询
export async function messageTagListUriRq(params) {
  return request.get(toQs(messageTagListUri, params));
}
// 新增消息通知标签配置
export async function messageTagInsertUriRq(params) {
  return request.post(messageTagInsertUri, {
    body: params,
  });
}
// 删除消息通知标签配置
export async function messageTagDeleteUriRq(payload) {
  return request.patch(toUrl(messageTagDeleteUri, payload));
}
// 消息通知标签配置详情
export async function messageTagDetailUriRq(id) {
  return request.get(toUrl(messageTagDetailUri, id));
}

// 消息通知屏蔽配置列表查询
export async function messageShieldingListUriRq(params) {
  return request.get(toQs(messageShieldingListUri, params));
}
// 新增消息通知屏蔽配置
export async function messageShieldingInsertUriRq(params) {
  return request.post(messageShieldingInsertUri, {
    body: params,
  });
}
// 删除消息通知屏蔽配置
export async function messageShieldingDeleteUriRq(payload) {
  return request.patch(toUrl(messageShieldingDeleteUri, payload));
}
// 消息通知屏蔽配置详情
export async function messageShieldingDetailUriRq(id) {
  return request.get(toUrl(messageShieldingDetailUri, id));
}
// 消息屏蔽-查询发布来源(用于下拉框，包含消息编码)
export async function queryRelaeseSourceUriRq(params) {
  return request.get(toQs(queryRelaeseSourceUri, params));
}
// 发布范围指定角色的下拉数据来源
export async function queryRolesUriRq(params) {
  return request.get(toQs(queryRolesUri, params));
}
