import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { cos } = api.production;

// 常规报销
export async function expenseClaimCreate(param) {
  return request.post(cos.expenseClaimCreateUri, { body: param });
}
export async function expenseClaimOverallModify(param) {
  return request.put(cos.expenseClaimOverallModifyUri, { body: param });
}
export async function expenseClaimPartialModify(param) {
  return request.put(cos.expenseClaimPartialModifyUri, { body: param });
}
export async function expenseClaimFinishPay(param) {
  return request.put(toQs(cos.expenseClaimFinishPayUri, param));
}
export async function expenseClaimDetail(param) {
  return request.get(toUrl(cos.expenseClaimDetailUri, param));
}
export async function expenseClaimListPaging(param) {
  return request.get(toQs(cos.expenseClaimListPagingUri, param));
}
export async function expenseClaimLogicalDelete(param) {
  return request.patch(toQs(cos.expenseClaimLogicalDeleteUri, param));
}

// 借款申请
export async function loanApplyCreate(param) {
  return request.post(cos.loanApplyCreateUri, { body: param });
}
export async function loanApplyOverallModify(param) {
  return request.put(cos.loanApplyOverallModifyUri, { body: param });
}
export async function loanApplyPartialModify(param) {
  return request.put(cos.loanApplyPartialModifyUri, { body: param });
}
export async function loanApplyFinishPay(param) {
  return request.put(toQs(cos.loanApplyFinishPayUri, param));
}
export async function loanApplyDetail(param) {
  return request.get(toUrl(cos.loanApplyDetailUri, param));
}
export async function loanApplyListPaging(param) {
  return request.get(toQs(cos.loanApplyListPagingUri, param));
}
export async function loanApplyLogicalDelete(param) {
  return request.patch(toQs(cos.loanApplyLogicalDeleteUri, param));
}

// 其他付款单
export async function otherPaymentCreate(param) {
  return request.post(cos.otherPaymentCreateUri, { body: param });
}
export async function otherPaymentOverallModify(param) {
  return request.put(cos.otherPaymentOverallModifyUri, { body: param });
}
export async function otherPaymentPartialModify(param) {
  return request.put(cos.otherPaymentPartialModifyUri, { body: param });
}
export async function otherPaymentFinishPay(param) {
  return request.put(toQs(cos.otherPaymentFinishPayUri, param));
}
export async function otherPaymentDetail(param) {
  return request.get(toUrl(cos.otherPaymentDetailUri, param));
}
export async function otherPaymentListPaging(param) {
  return request.get(toQs(cos.otherPaymentListPagingUri, param));
}
export async function otherPaymentLogicalDelete(param) {
  return request.patch(toQs(cos.otherPaymentLogicalDeleteUri, param));
}
