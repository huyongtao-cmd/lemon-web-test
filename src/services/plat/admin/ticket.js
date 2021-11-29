import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const { tickets, ticketsSave } = api.plat.addr;

export async function queryTicketList(params) {
  return request.get(toUrl(tickets, params));
}

export async function saveTicketList(params) {
  return request.put(ticketsSave, { body: params });
}
