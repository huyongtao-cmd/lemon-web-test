import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { udcList, udcDetail, udcSelect, udcDetailList, udcDetailCreate } = api.sys.udc;

export async function selectUdc() {
  return request.get(udcSelect);
}

export async function queryUdcList(params) {
  return request.get(toQs(udcList, params));
}

export async function createUdc(params) {
  return request(udcList, {
    method: 'POST',
    body: params,
  });
}

export async function createUdcDetail(params) {
  return request(udcDetailCreate, {
    method: 'POST',
    body: params,
  });
}

export async function editUdcDetail(params) {
  return request(udcDetailCreate, {
    method: 'PATCH',
    body: params,
  });
}

export async function deleteUdcDetail(params) {
  return request(udcDetailCreate, {
    method: 'DELETE',
    body: params,
  });
}

export async function eidtUdc(params) {
  return request(udcList, {
    method: 'PATCH',
    body: params,
  });
}

export async function detailUdc(defId) {
  return request.get(toUrl(udcDetail, { defId }));
}

export async function listUdcDetail(defId) {
  return request.get(toUrl(udcDetailList, { defId }));
}
