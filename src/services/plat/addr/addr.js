import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  addr,
  addrs,
  addrSup,
  addrSupInfo,
  addrSel,
  addrSaveBasic,
  addrSaveSup,
  addrSavePerson,
  addrSaveCompany,
  addrSaveContact,
  addrSaveBank,
  addrSaveInvoice,
  addrSaveBook,
  addrSaveCode,
  addrSaveCust,
  addrSaveCoop,
  addrDel,
  abList,
  addrSaveAll,
  insertCustSupplierToU8c,
} = api.plat.addr;

export async function queryAbList() {
  return request.get(abList);
}

export async function queryAddrList(params) {
  return request.get(toQs(addrs, params));
}

export async function queryAddrSup(params) {
  return request.get(toQs(addrSup, params));
}

export async function queryAddrListSelect(params) {
  return request.get(toQs(addrSel, params));
}

export async function findAddrByNo(params) {
  return request.get(toUrl(addr, params));
}

export async function findAddrSupByNo(params) {
  return request.get(toUrl(addrSupInfo, params));
}

export async function saveAddrBasic(params) {
  return request.put(addrSaveBasic, {
    body: params,
  });
}

export async function saveAddrSup(params) {
  return request.put(addrSaveSup, {
    body: params,
  });
}

export async function saveAddrPerson(params) {
  return request.put(addrSavePerson, {
    body: params,
  });
}

export async function saveAddrCompany(params) {
  return request.put(addrSaveCompany, {
    body: params,
  });
}

export async function saveAddrContact(params) {
  return request.put(addrSaveContact, {
    body: params,
  });
}

export async function saveAddrBank(params) {
  return request.put(addrSaveBank, {
    body: params,
  });
}

export async function saveAddrInvoice(params) {
  return request.put(addrSaveInvoice, {
    body: params,
  });
}

export async function saveAddrBook(params) {
  return request.put(addrSaveBook, {
    body: params,
  });
}

export async function saveAddrCode(params) {
  return request.patch(addrSaveCode, {
    body: params,
  });
}

export async function saveAddrCust(params) {
  return request.put(addrSaveCust, {
    body: params,
  });
}

export async function saveAddrCoop(params) {
  return request.put(addrSaveCoop, {
    body: params,
  });
}

export async function saveAll(params) {
  return request.put(addrSaveAll, {
    body: params,
  });
}

export async function deleteAddrById({ id }) {
  return request.patch(toUrl(addrDel, { id }));
}

// 同步数据
export async function insertCustSupplierToU8cRp(params) {
  return request.post(toUrl(insertCustSupplierToU8c, params));
}
