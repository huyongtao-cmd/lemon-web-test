import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  // =======报销额度管理=======
  expenseQuotaPaging,
  expenseQuotaSave,
  expenseQuotaOverall,
  expenseQuotaPartial,
  expenseQuotaDetail,
  expenseQuotaDelete,
  // =======报销额度明细=======
  expenseQuotaDSave,
  expenseQuotaDOverall,
  expenseQuotaDDelete,
  expenseQuotaDDetail,
  relatedDimensions,
  expenseQuotaFindQuotasUri,
} = api.workbench.project;

// =====================报销额度明细======================
// 相关维度查询接口
export async function relatedDimensionsRq(params) {
  return request.get(toUrl(relatedDimensions, params));
}

// 明细接口
export async function expenseQuotaDDetailRq(params) {
  return request.get(toUrl(expenseQuotaDDetail, params));
}

// 删除接口
export async function expenseQuotaDDeleteRq(params) {
  return request.patch(toUrl(expenseQuotaDDelete, params));
}

// 整体更新接口
export async function expenseQuotaDOverallRq(params) {
  return request.put(expenseQuotaDOverall, {
    body: params,
  });
}

// 新增接口
export async function expenseQuotaDSaveRq(params) {
  return request.post(expenseQuotaDSave, {
    body: params,
  });
}

// =====================报销额度管理======================
// 列表查询接口
export async function expenseQuotaPagingRq(payload) {
  return request.get(toQs(expenseQuotaPaging, payload));
}

// 新增接口
export async function expenseQuotaSaveRq(params) {
  return request.post(expenseQuotaSave, {
    body: params,
  });
}

// 整体更新接口
export async function expenseQuotaOverallRq(params) {
  return request.put(expenseQuotaOverall, {
    body: params,
  });
}

// 指定更新接口
export async function expenseQuotaPartialRq(params) {
  return request.put(expenseQuotaPartial, {
    body: params,
  });
}

// 详情接口
export async function expenseQuotaDetailRq(params) {
  return request.get(toUrl(expenseQuotaDetail, params));
}

// 删除接口
export async function expenseQuotaDeleteRq(params) {
  return request.patch(toUrl(expenseQuotaDelete, params));
}

// 额度查询接口
export async function expenseQuotaFindQuotas(params) {
  return request.put(expenseQuotaFindQuotasUri, {
    body: params,
  });
}
