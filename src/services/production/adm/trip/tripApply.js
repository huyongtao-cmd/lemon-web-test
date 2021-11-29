import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { trip } = api.production;

// 出差申请 + 提交审评
export async function tripApplyCreateProcess(param) {
  return request.post(trip.tripApplyCreateProcessUri, { body: param });
}
// 出差申请 更新
export async function tripApplyOverallModifyProcess(param) {
  return request.put(trip.tripApplyOverallModifyProcessUri, { body: param });
}

// =========

// 出差申请
export async function tripApplyCreate(param) {
  return request.post(trip.tripApplyCreateUri, { body: param });
}

// 出差申请 更新
export async function tripApplyOverallModify(param) {
  return request.put(trip.tripApplyOverallModifyUri, { body: param });
}

// 出差申请部分修改
export async function tripApplyPartialModify(param) {
  return request.put(trip.tripApplyPartialModifyUri, { body: param });
}

// 出差申请详情
export async function tripApplyDetail(param) {
  return request.get(toUrl(trip.tripApplyDetailUri, param));
}

// 出差申请分页查询
export async function tripApplyListPaging(param) {
  return request.get(toQs(trip.tripApplyListPagingUri, param));
}
// 出差申请分页查询
export async function tripApplyMyTripListPaging(param) {
  return request.get(toQs(trip.tripApplyMyTripListPagingUri, param));
}

// 出差申请删除
export async function tripApplyLogicalDelete(param) {
  return request.patch(toQs(trip.tripApplyLogicalDeleteUri, param));
}
// ======  出差费用管理 =======

// 出差费用明细
export async function tripExpenseDetailCreate(param) {
  return request.post(trip.tripExpenseDetailCreateUri, { body: param });
}

// 出差费用明细 更新
export async function tripExpenseDetailOverallModify(param) {
  return request.put(trip.tripExpenseDetailOverallModifyUri, { body: param });
}

// 出差费用明细部分修改
export async function tripExpenseDetailPartialModify(param) {
  return request.put(trip.tripExpenseDetailPartialModifyUri, { body: param });
}

// 出差费用明细详情
export async function tripExpenseDetailDetail(param) {
  return request.get(toUrl(trip.tripExpenseDetailDetailUri, param));
}

// 出差费用明细分页查询
export async function tripExpenseDetailListPaging(param) {
  return request.get(toQs(trip.tripExpenseDetailListPagingUri, param));
}

// 出差费用列表查询-不分页全部查询
export async function tripExpenseDetailListAllData(param) {
  return request.get(toQs(trip.tripExpenseDetailListAllDataUri, param));
}
//
export async function othersTripExpenseData(param) {
  return request.post(trip.othersTripExpenseDataUri, { body: param });
}

// 出差费用明细分页查询
export async function tripExpenseDetailMyTripListPaging(param) {
  return request.get(toQs(trip.tripExpenseDetailMyTripListPagingUri, param));
}

// 出差费用明细删除
export async function tripExpenseDetailLogicalDelete(param) {
  return request.patch(toQs(trip.tripExpenseDetailLogicalDeleteUri, param));
}

// 行政订票结算
export async function tripManagementClaimListPaging(param) {
  return request.get(toQs(trip.tripManagementClaimListPagingUri, param));
}
// 行政订票结算
export async function tripManagementClaimLogicalDelete(param) {
  return request.patch(toQs(trip.tripManagementClaimLogicalDelete, param));
}
export async function tripManagementClaimCreate(param) {
  return request.post(trip.tripManagementClaimCreateUri, { body: param });
}
export async function tripManagementClaimOverallModify(param) {
  return request.put(trip.tripManagementClaimOverallModifyUri, { body: param });
}
export async function tripManagementClaimDetail(param) {
  return request.get(toUrl(trip.tripManagementClaimDetailUri, param));
}
// 行政订票
export async function tripManagementCreateUri(param) {
  return request.post(trip.tripManagementCreateUri, { body: param });
}
export async function tripManagementDetail(param) {
  return request.get(toUrl(trip.tripManagementDetailUri, param));
}
export async function tripManagementPerson(param) {
  return request.get(toUrl(trip.tripManagementPersonUri, param));
}
export async function tripManagementOverallModify(param) {
  return request.put(trip.tripManagementOverallModifyUri, { body: param });
}
export async function tripManagementModify(param) {
  return request.put(trip.tripManagementModifyUri, { body: param });
}
export async function getAllBookingDetail(param) {
  return request.patch(toUrl(trip.getAllBookingDetailUri, param));
}
