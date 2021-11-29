import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  list,
  batch,
  details,
  submit,
  exportTripTickets,
  exportTripTicketsReim,
} = api.plat.ticketMgmt;

export async function queryTicketMgmtList(params) {
  return request.get(toQs(list, params));
}

export async function startBatch(ids) {
  return request.put(batch.replace(':ids', ids.join(',')));
}

export async function getTicketMgmtDetails(params) {
  return request.get(details.replace(':ids', params));
}

export async function submitApply(params) {
  const { ids, payMethod, abAccId, remark } = params;
  return request.post(toQs(toUrl(submit, { ids, payMethod, abAccId }), { remark }));
}

// 导出差旅对账表
export async function queryExportTripTickets(params) {
  return request.get(toQs(exportTripTickets, params));
}

// 导出因公差旅报销表
export async function queryExportTripTicketsReim(params) {
  return request.get(toQs(exportTripTicketsReim, params));
}
