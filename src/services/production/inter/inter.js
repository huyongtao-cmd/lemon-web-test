import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toUrl } from '@/utils/stringUtils';

const {
  insertDeptToU8cUri,
  insertCustSupplierToU8cUri,
  insertPsnToU8cUri,
  insertAccToU8cUri,
} = api.production.inter;

// 把新增的部门数据同步到用友
export async function insertDeptToU8c(param) {
  return request.post(toUrl(insertDeptToU8cUri, param));
}
// 把新增的客商数据同步到用友
export async function insertCustSupplierToU8c(param) {
  return request.post(toUrl(insertCustSupplierToU8cUri, param));
}
// 把新增的人员数据同步到用友
export async function insertPsnToU8c(param) {
  return request.post(toUrl(insertPsnToU8cUri, param));
}
// 把新增的科目数据同步到用友
export async function insertAccToU8c(param) {
  return request.post(toUrl(insertAccToU8cUri, param));
}
