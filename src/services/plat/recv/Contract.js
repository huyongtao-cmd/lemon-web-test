import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  recvplanList,
  recvplanDetail,
  invInfoSelect,
  invInfoDetial,
  invBatch,
  invBatchInfoSave,
  invInput,
  // invSubmit,
  // taskInvSubmit,
  taskInvBatch,
  recvplans,
  // recvplanListSave,
  defaultRule,
  selectCustExpApplyNo,
  ouInternal,
  recvPlanMultiColSelect,
} = api.plat.recv;

export async function queryRecvplanList(params) {
  return request.get(toQs(recvplanList, params));
}

export async function queryRecvplanDetail(recvPlanId) {
  return request.get(toUrl(recvplanDetail, { recvPlanId }));
}

export async function saveRecvplanList(params) {
  return request(recvplanList, {
    method: 'PATCH',
    body: params,
  });
}

export async function selectInvInfo(custId) {
  return request.get(toUrl(invInfoSelect, custId));
}

export async function detailInvInfo(id) {
  return request.get(toUrl(invInfoDetial, id));
}

export async function saveInvBatch(params) {
  return request(invBatch, {
    method: 'POST',
    body: params,
  });
}

export async function saveInvBatchInfo(invBatchId, params) {
  return request(toUrl(invBatchInfoSave, { invBatchId }), {
    method: 'POST',
    body: params,
  });
}

export async function finishInvBatch(params) {
  return request(invBatch, {
    method: 'PATCH',
    body: params,
  });
}

export async function saveInvInput(params) {
  return request(invInput, {
    method: 'POST',
    body: params,
  });
}

export async function invApply({ id }) {
  return request.post(toUrl(taskInvBatch, { id }));
}

// 根据收款计划id数组  查询收款计划表
export async function queryRecvplansByIds(ids) {
  return request.get(toUrl(recvplans, { ids }));
}

// export async function invSubmitTask({ taskId, params }) {
//   return request.post(toUrl(taskInvSubmit, { taskId }), {
//     body: params,
//   });
// }

// 收款计划列表、项目汇报列表按默认规则分配
export async function defaultRuleRq(params) {
  return request.post(toUrl(defaultRule, params));
}

export async function selectApplyNo() {
  return request.get(selectCustExpApplyNo);
}

// 签约公司下拉
export async function ouInternalRq(params) {
  return request.get(ouInternal);
}
// 收款计划多列下拉
export async function selectRecvPlanMultiCol(params) {
  return request.get(toQs(recvPlanMultiColSelect, params));
}
