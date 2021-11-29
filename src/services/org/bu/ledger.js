import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { buLedger, buLedgerIo, ledgerIoByBu } = api.org;

// bu账户
export async function findBuLedger() {
  return request.get(buLedger);
}

// bu账户 - 台账
export async function findBuLedgerIo(params) {
  return request.get(toQs(buLedgerIo, params));
}

// BU当量交易记录
export async function findLedgerIoByBu(params) {
  return request.get(toQs(ledgerIoByBu, params));
}
