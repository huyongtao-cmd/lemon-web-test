import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const { purchaseAgreement } = api.sale;

// 列表
export async function queryList(params) {
  return request.get(toQs(purchaseAgreement.queryList, params));
}

// 查询编辑信息
export async function queryEdit(params) {
  return request.get(toUrl(purchaseAgreement.queryEdit, { id: params }));
}

// 关联协议下拉
export async function selectAssociation(params) {
  return request.get(toQs(purchaseAgreement.selectAssociation, params));
}

// 保存
export async function save(params) {
  return request.post(purchaseAgreement.save, {
    body: params,
  });
}

// 查询详情
export async function queryDetail(params) {
  return request.get(toUrl(purchaseAgreement.queryDetail, { id: params }));
}

// 激活
export async function active(params) {
  return request.post(toUrl(purchaseAgreement.active, { id: params }));
}

// 暂挂
export async function pending(params) {
  return request.post(toUrl(purchaseAgreement.pending, { id: params }));
}

// 终止
export async function over(params) {
  return request.post(purchaseAgreement.over, {
    body: params,
  });
}

// 删除
export async function remove(params) {
  return request.patch(toUrl(purchaseAgreement.remove, params));
}
