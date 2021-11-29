import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  // 销售单管理
  saleOrderPging,
  saleOrderIncrease,
  saleOrderOverall,
  saleOrderPartial,
  saleOrderDelete,
  saleOrderDetail,
  saleOrderAdjustDetail,
  saleOrderAdjust,
} = api.production.sale;

// =====================销售单管理======================
// 列表
export async function saleOrderPgingRq(payload) {
  return request.get(toQs(saleOrderPging, payload));
}
// 新增
export async function saleOrderIncreaseRq(params) {
  return request.post(saleOrderIncrease, {
    body: params,
  });
}
// 整体更新
export async function saleOrderOverallRq(params) {
  return request.put(saleOrderOverall, {
    body: params,
  });
}
// 指定更新
export async function saleOrderPartialRq(params) {
  return request.put(saleOrderPartial, {
    body: params,
  });
}
// 详情
export async function saleOrderDetailRq(params) {
  return request.get(toUrl(saleOrderDetail, params));
}
// 详情
export async function saleOrderAdjustDetailRq(params) {
  return request.get(toUrl(saleOrderAdjustDetail, params));
}
// 删除
export async function saleOrderDeleteRq(params) {
  return request.patch(toUrl(saleOrderDelete, params));
}

// 整体更新
export async function saleOrderAdjustRq(params) {
  return request.put(saleOrderAdjust, {
    body: params,
  });
}
