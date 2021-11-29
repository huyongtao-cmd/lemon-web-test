import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  // 收款计划管理
  collectionPlanPging,
  collectionPlanIncrease,
  collectionPlanOverall,
  collectionPlanPartial,
  collectionPlanDelete,
  collectionPlanDetail,
  salesInvoiceApplySave,
  saveCollectionData,
  getBankInfo,
  getCollectionDetailById,
} = api.production.collectionPlan;

// =====================收款计划管理======================
// 根据收款计划查收款明细
export async function getCollectionDetailByIdRq(params) {
  return request.get(toUrl(getCollectionDetailById, params));
}

// 银行账户信息
export async function getBankInfoRq(params) {
  return request.get(toUrl(getBankInfo, params));
}

// 收款录入保存
export async function saveCollectionDataRq(params) {
  return request.post(saveCollectionData, {
    body: params,
  });
}

// 申请开票保存
export async function salesInvoiceApplySaveRq(params) {
  return request.post(salesInvoiceApplySave, {
    body: params,
  });
}
// 列表
export async function collectionPlanPgingRq(payload) {
  return request.get(toQs(collectionPlanPging, payload));
}
// 新增
export async function collectionPlanIncreaseRq(params) {
  return request.post(collectionPlanIncrease, {
    body: params,
  });
}
// 整体更新
export async function collectionPlanOverallRq(params) {
  return request.put(collectionPlanOverall, {
    body: params,
  });
}
// 指定更新
export async function collectionPlanPartialRq(params) {
  return request.put(collectionPlanPartial, {
    body: params,
  });
}
// 详情
export async function collectionPlanDetailRq(params) {
  return request.get(toUrl(collectionPlanDetail, params));
}
// 删除
export async function collectionPlanDeleteRq(params) {
  return request.patch(toUrl(collectionPlanDelete, params));
}
