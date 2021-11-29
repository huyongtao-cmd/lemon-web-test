import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  getInvoiceList,
  inValidInvoices,
  changeOwner,
  invoiceDtl,
  getInvoicesFromBaiwang,
  delInvoiceUrl,
} = api.user.invoice;

// 根据筛选条件获取会议室列表
export async function getInvoiceListRq(params) {
  return request.get(toQs(getInvoiceList, params));
}

// 根据id获取发票详情
export async function invoiceDtlRq(id) {
  return request.get(toUrl(invoiceDtl, { id }));
}

// 作废发票(批量)
export async function inValidInvoicesRq(data) {
  return request.patch(toUrl(inValidInvoices, data));
}

// 修改归属人(批量)
export async function changeOwnerRq(ids, ownerId) {
  return request.patch(toUrl(changeOwner, { ids, ownerId }));
}

export async function getInvoicesFromBaiwangRq() {
  return request.get(toUrl(getInvoicesFromBaiwang, {}));
}

export async function delInvoice(ids) {
  return request.patch(toUrl(delInvoiceUrl, { ids }));
}
