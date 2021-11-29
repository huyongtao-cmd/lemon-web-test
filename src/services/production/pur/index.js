import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { pur } = api.production;

export async function purchaseCreate(param) {
  return request.post(pur.purchaseCreateUri, { body: param });
}

export async function purchaseDetail(param) {
  return request.get(toUrl(pur.purchaseDetailUri, param));
}

export async function purchaseOverallModify(param) {
  return request.put(pur.purchaseOverallModifyUri, { body: param });
}

export async function purchaseListPaging(param) {
  return request.get(toQs(pur.purchaseListPagingUri, param));
}

export async function purchaseLogicalDelete(param) {
  return request.patch(toQs(pur.purchaseLogicalDeleteUri, param));
}
export async function purchasePartialModify(param) {
  return request.put(pur.purchasePartialModifyUri, { body: param });
}

export async function paymentPlanListPaging(param) {
  return request.get(toQs(pur.paymentPlanListPagingUri, param));
}

export async function findPaymentRequestIdByIds(param) {
  return request.get(toQs(pur.findPaymentRequestIdByIdsUri, param));
}

export async function paymentRequestCreate(param) {
  return request.post(pur.paymentRequestCreateUri, { body: param });
}

export async function paymentRequestListPagingUri(param) {
  return request.get(toQs(pur.paymentRequestListPagingUri, param));
}

export async function paymentRequestDetail(param) {
  return request.get(toUrl(pur.paymentRequestDetailUri, param));
}

export async function paymentRequestOverall(param) {
  return request.put(pur.paymentRequestOverallModifyUri, { body: param });
}

export async function paymentRequestModify(param) {
  return request.put(pur.paymentRequestModifyUri, { body: param });
}

export async function paymentComplete(param) {
  return request.put(pur.paymentCompleteUri, { body: param });
}

export async function paymentRequestLogicalDelete(param) {
  return request.patch(toQs(pur.paymentRequestLogicalDeleteUri, param));
}
// 完成付款
export async function paymentRequestCompletePayment(param) {
  return request.get(toQs(pur.paymentRequestCompletePaymentUri, param));
}

export async function purchaseCheck(param) {
  return request.put(pur.purchaseCheckUri, { body: param });
}
