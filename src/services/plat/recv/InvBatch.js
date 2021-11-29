import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  invBatch,
  invPrint,
  invBatchDetail,
  invBatchContract,
  invBatchInfo,
  getCustId,
  taskInvBatch,
  invBatchDetailList,
  recvplanslList,
  rollbackInvBatch,
  getContractInfo,
  invBatches,
  refundReason,
  innerAccountSelect,
  updateRecvInfo,
  getAccountNoByInvId,
  getInvoiceItemList,
} = api.plat.recv;

// 商品信息下拉
export async function getInvoiceItemListRq(params) {
  return request.get(toQs(getInvoiceItemList, params));
}

export async function queryInvBatchesList(params) {
  return request.get(toQs(invBatches, params));
}

export async function queryInvBatchList(params) {
  return request.get(toQs(invBatch, params));
}

export async function queryInvPrint(id) {
  return request.get(toUrl(invPrint, { id }));
}

export async function detailInvBatch(id) {
  return request.get(toUrl(invBatchDetail, id));
}

export async function detailInvBatchList(ids) {
  return request.get(toUrl(invBatchDetailList, ids));
}

export async function detailRecvplanslList(ids) {
  return request.get(toUrl(recvplanslList, ids));
}

export async function contractInvBatch(id) {
  return request.get(toUrl(invBatchContract, id));
}

export async function infoInvBatch(id) {
  return request.get(toUrl(invBatchInfo, id));
}

export async function custIdGet(invId) {
  return request.get(toUrl(getCustId, invId));
}

export async function invBatchTask(id, params) {
  return request(toUrl(taskInvBatch, { id }), {
    method: 'POST',
    body: params,
  });
}

export async function rollbackContract(ids) {
  // 这里不用 otUrl 因为会被 encoding
  return request.patch(rollbackInvBatch.replace(':ids', ids));
}

export async function getContractInfoById(params) {
  return request.get(toQs(getContractInfo, params));
}

export async function putSaveRefundReasonById({ invBatchId, disDisc }) {
  return request.put(toUrl(refundReason, { invBatchId, disDisc }));
}
// 公司内部银行账号多列下拉
export async function selectInnerAccount() {
  return request.get(innerAccountSelect);
}

// 更新收款表银行账号、总账日期
export async function updateRecvAccount(param) {
  return request.patch(toUrl(updateRecvInfo, param));
}

// 查询开票记录对应的合同的签约公司的银行账户
export async function getAccountByInvId(param) {
  return request.get(toUrl(getAccountNoByInvId, param));
}
