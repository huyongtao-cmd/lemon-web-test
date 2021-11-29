import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { common } = api.production;

// 资源下拉选择
export async function resSelectPaging(param) {
  return request.get(toQs(common.resSelectPagingUri, param));
}
// 公司下拉选择
export async function ouSelectPaging(param) {
  return request.get(toQs(common.ouSelectPagingUri, param));
}
// 公司下拉选择
export async function allOuSelectPaging(param) {
  return request.get(toQs(common.allOuSelectPagingUri, param));
}
// 部门下拉选择
export async function buSelectPaging(param) {
  return request.get(toQs(common.buSelectPagingUri, param));
}
// 报表部门下拉选择
export async function reportBuSelectPaging(param) {
  return request.get(toQs(common.reportBuSelectPagingUri, param));
}
// 合同下拉选择
export async function contractSelectPaging(param) {
  return request.get(toQs(common.contractSelectPagingUri, param));
}
// 项目下拉选择
export async function projectSelectPaging(param) {
  return request.get(toQs(common.projectSelectPagingUri, param));
}
// 产品下拉选择
export async function productSelectPaging(param) {
  return request.get(toQs(common.productSelectPagingUri, param));
}
// 核算项目下拉选择
export async function businessAccItemPaging(param) {
  return request.get(toQs(common.businessAccItemPagingUri, param));
}
// 地址簿下拉选择
export async function abSelectPaging(param) {
  return request.get(toQs(common.abSelectPagingUri, param));
}

// 租户下拉选择
export async function tenantSelectPaging(param) {
  return request.get(toQs(common.tenantSelectPagingUri, param));
}

// UDC下拉选择
export async function udcSelect(param) {
  return request.get(toUrl(common.udcSelect, param));
}
// 预算下拉选择
export async function budgetSelectPaging(param) {
  return request.get(toQs(common.budgetSelectPagingUri, param));
}

// 供应商下拉选择
export async function supplierSelectPaging(param) {
  return request.get(toQs(common.supplierSelectPagingUri, param));
}

// 账户下拉选择
export async function accountSelectPaging(param) {
  return request.get(toQs(common.accountSelectPagingUri, param));
}

//相关申请单下拉选择
export async function tripApplySelectPaging(param) {
  return request.get(toQs(common.tripApplySelectPagingUri, param));
}

// 借款申请相关申请单下拉选择
export async function loanApplySelectPaging(param) {
  return request.get(toQs(common.loanApplySelectPagingUri, param));
}
