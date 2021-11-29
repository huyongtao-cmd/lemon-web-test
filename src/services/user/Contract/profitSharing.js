import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  platformProfileList,
  sharingList,
  otherRecvList,
  sharingListSave,
  otherRecvListSave,
  sharingListReset,
  sharingListForceReset,
  createSharingListReset,
  queryChildContractDetail,
  queryChildContractFlowDetail,
  startChildContractProc,
  examineByProfitAgree,
  contractOtherStlApply,
  getProAgreesByRuleId,
  getNewRuleByContId,
  saveNewRule,
} = api.user.contract;

// 子合同利益分配修改 - 修改子合同利益分配
export async function saveNewRuleRq(params) {
  return request.post(saveNewRule, {
    body: params,
  });
}

// 子合同利益分配详情 - 修改子合同利益分配
export async function getNewRuleByContIdRq(params) {
  return request.get(toUrl(getNewRuleByContId, params));
}

export async function getPlatformProfileList(contractId) {
  return request(platformProfileList.replace('{contractId}', contractId), {
    method: 'GET',
  });
}

export async function getSharingList(contractId) {
  return request(sharingList.replace('{contractId}', contractId), {
    method: 'GET',
  });
}

export async function getOtherRecvList(contractId) {
  return request(otherRecvList.replace('{contractId}', contractId), {
    method: 'GET',
  });
}

// 保存
export async function saveSharingList(id, profitRuleId, params) {
  return request.put(toQs(sharingListSave.replace('{contractId}', id), { profitRuleId }), {
    body: params,
  });
}

// 保存其他收付计划
export async function saveOtherRecvList(id, params) {
  return request.put(otherRecvListSave.replace('{contractId}', id), {
    body: params,
  });
}

export async function resetSharingList(contractId) {
  return request.put(toUrl(sharingListReset, { contractId }));
}

// 重新生成
export async function resetCreateSharingList(contractId) {
  return request.get(toUrl(createSharingListReset, { contractId }));
}

export async function forceResetSharingList(contractId) {
  return request.put(toUrl(sharingListForceReset, { contractId }));
}

// 子合同利益分配详情
export async function queryChildContractDetailRq(contractId) {
  return request.get(toUrl(queryChildContractDetail, { contractId }));
}

// 子合同利益分配发起流程
export async function startChildContractProcRq(params) {
  return request.post(startChildContractProc, {
    body: params,
  });
}

// 子合同利益分配流程第二节点
export async function examineByProfitAgreeRq(taskId, params) {
  return request.post(toUrl(examineByProfitAgree, { taskId }), {
    body: params,
  });
}

// 子合同利益分配流程详情
export async function queryChildContractFlowDetailRq(modifyId) {
  return request.get(toUrl(queryChildContractFlowDetail, modifyId));
}
// 合同其他收付计划 发结算申请
export async function contOtherStlApply(otherRecv) {
  return request.post(toUrl(contractOtherStlApply, { otherRecv }));
}
export async function getProfitAgreesByRuleId({ contractId, profitRuleId }) {
  const url = toUrl(getProAgreesByRuleId, { contractId, profitRuleId });
  return request.get(url);
}
