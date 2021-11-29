import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { system } = api.sys;

// 租户管理
export async function tenantCreate(param) {
  return request.post(system.tenantCreateUri, { body: param });
}
export async function tenantModify(param) {
  return request.put(system.tenantModifyUri, { body: param });
}
export async function tenantDetail(param) {
  return request.get(toUrl(system.tenantDetailUri, param));
}
export async function tenantListPaging(param) {
  return request.get(toQs(system.tenantListPagingUri, param));
}
export async function tenantLogicalDelete(param) {
  return request.patch(toQs(system.tenantLogicalDeleteUri, param));
}

// 租户菜单管理
export async function navTenantCreate(param) {
  return request.post(system.navTenantCreateUri, { body: param });
}
export async function navTenantModify(param) {
  return request.put(system.navTenantModifyUri, { body: param });
}
export async function navTenantDetail(param) {
  return request.get(toUrl(system.navTenantDetailUri, param));
}
export async function navTenantListPaging(param) {
  return request.get(toQs(system.navTenantListPagingUri, param));
}
export async function navTenantLogicalDelete(param) {
  return request.patch(toQs(system.navTenantLogicalDeleteUri, param));
}
export async function navTenantManage(param) {
  return request.put(system.navTenantManageUri, { body: param });
}
export async function navTenantDetailByCode(param) {
  return request.get(toUrl(system.navTenantDetailByCodeUri, param));
}
