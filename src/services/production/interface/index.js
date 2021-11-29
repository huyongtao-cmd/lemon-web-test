import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  // 应收
  insertWillCollectionToU8c,
  willCollectionSave,
  willCollectionDelete,
  willCollectionDetail,
  willCollectionPaging,
  // 应付
  insertWillPayToU8c,
  willPaySave,
  willPayDelete,
  willPayDetail,
  willPayPaging,
  // 付款
  insertPayToU8c,
  paySave,
  payDelete,
  payDetail,
  payPaging,
  // 收款
  insertCollectionToU8c,
  collectionSave,
  collectionDelete,
  collectionDetail,
  collectionPaging,
} = api.production.interface;

// =====================收款======================
// 同步数据
export async function insertCollectionToU8cRq(params) {
  return request.post(toUrl(insertCollectionToU8c, params));
}
// 列表
export async function collectionPagingRq(payload) {
  return request.get(toQs(collectionPaging, payload));
}
// 保存+修改
export async function collectionSaveRq(params) {
  return request.post(collectionSave, {
    body: params,
  });
}
// 详情
export async function collectionDetailRq(params) {
  return request.get(toUrl(collectionDetail, params));
}
// 删除
export async function collectionDeleteRq(params) {
  return request.patch(toUrl(collectionDelete, params));
}

// =====================付款======================
// 同步数据
export async function insertPayToU8cRq(params) {
  return request.post(toUrl(insertPayToU8c, params));
}
// 列表
export async function payPagingRq(payload) {
  return request.get(toQs(payPaging, payload));
}
// 保存+修改
export async function paySaveRq(params) {
  return request.post(paySave, {
    body: params,
  });
}
// 详情
export async function payDetailRq(params) {
  return request.get(toUrl(payDetail, params));
}
// 删除
export async function payDeleteRq(params) {
  return request.patch(toUrl(payDelete, params));
}

// =====================应付======================
// 同步数据
export async function insertWillPayToU8cRq(params) {
  return request.post(toUrl(insertWillPayToU8c, params));
}
// 列表
export async function willPayPagingRq(payload) {
  return request.get(toQs(willPayPaging, payload));
}
// 保存+修改
export async function willPaySaveRq(params) {
  return request.post(willPaySave, {
    body: params,
  });
}
// 详情
export async function willPayDetailRq(params) {
  return request.get(toUrl(willPayDetail, params));
}
// 删除
export async function willPayDeleteRq(params) {
  return request.patch(toUrl(willPayDelete, params));
}

// =====================应收======================
// 同步数据
export async function insertWillCollectionToU8cRq(params) {
  return request.post(toUrl(insertWillCollectionToU8c, params));
}
// 列表
export async function willCollectionPagingRq(payload) {
  return request.get(toQs(willCollectionPaging, payload));
}
// 保存+修改
export async function willCollectionSaveRq(params) {
  return request.post(willCollectionSave, {
    body: params,
  });
}
// 详情
export async function willCollectionDetailRq(params) {
  return request.get(toUrl(willCollectionDetail, params));
}
// 删除
export async function willCollectionDeleteRq(params) {
  return request.patch(toUrl(willCollectionDelete, params));
}
