import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  // 开票批次
  salesInvoiceApplyPging,
  salesInvoiceApplyOverall,
  salesInvoiceApplyPartial,
  salesInvoiceApplyDelete,
  salesInvoiceApplyDetail,
  salesInvoiceApplySave,
} = api.production.salesInvoice;

// =====================收款计划管理======================
// 新增加保存
export async function salesInvoiceApplySaveRq(params) {
  return request.post(salesInvoiceApplySave, {
    body: params,
  });
}
// 列表
export async function salesInvoiceApplyPgingRq(payload) {
  return request.get(toQs(salesInvoiceApplyPging, payload));
}
// 整体更新
export async function salesInvoiceApplyOverallRq(params) {
  return request.put(salesInvoiceApplyOverall, {
    body: params,
  });
}
// 指定更新
export async function salesInvoiceApplyPartialRq(params) {
  return request.put(salesInvoiceApplyPartial, {
    body: params,
  });
}
// 详情
export async function salesInvoiceApplyDetailRq(params) {
  return request.get(toUrl(salesInvoiceApplyDetail, params));
}
// 删除
export async function salesInvoiceApplyDeleteRq(params) {
  return request.patch(toUrl(salesInvoiceApplyDelete, params));
}
