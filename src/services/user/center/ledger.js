import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { resLedger, resLedgerIo, ledgerIoByRes } = api.org;

// 个人账户
export async function findResLedger() {
  return request.get(resLedger);
}
// 个人账户 - 台账
export async function findResLedgerIo(params) {
  return request.get(toQs(resLedgerIo, params));
}

// 个人当量交易记录
export async function findLedgerIoByRes(params) {
  return request.get(toQs(ledgerIoByRes, params));
}
