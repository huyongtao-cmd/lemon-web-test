import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { myAcc, abAccs, abAcc, abAccDel, abAccsByRes, abAccByRes } = api.sys;

export async function findAbAccList(params) {
  return request.get(toQs(abAccs, params));
}

export async function findMyAccList() {
  return request.get(myAcc);
}

export async function abAccCreate(params) {
  return request.post(abAccs, {
    body: params,
  });
}

export async function abAccUpdate(params) {
  return request.put(toUrl(abAcc, { id: params.id }), {
    body: params,
  });
}

export async function deleteAbAccs(ids) {
  return request.patch(toUrl(abAccDel, { ids: ids.join(',') }));
}

export async function abAccByResCreate(params) {
  return request.post(abAccsByRes, {
    body: params,
  });
}

export async function abAccByResUpdate(params) {
  return request.put(toUrl(abAccByRes, { id: params.id }), {
    body: params,
  });
}
