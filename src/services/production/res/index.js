import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  // 销售单管理
  payRollPaging,
  payRollDetail,
  payRollDelete,
  payrollImport,
  myPayRollPaging,
} = api.production.res;

// 我的工资单列表
export async function myPayRollPagingRq(payload) {
  return request.get(toQs(myPayRollPaging, payload));
}
// 列表
export async function payRollPagingRq(payload) {
  return request.get(toQs(payRollPaging, payload));
}
// 详情
export async function payRollDetailRq(params) {
  return request.get(toUrl(payRollDetail, params));
}
// 删除
export async function payRollDeleteRq(params) {
  return request.patch(toUrl(payRollDelete, params));
}
// excel导入
export async function payrollImportRq(payload) {
  return request.post(payrollImport, {
    body: payload,
  });
}
