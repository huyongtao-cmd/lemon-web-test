import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { auAccs } = api.plat.auacc;

export async function findAuAccList(params) {
  return request.get(toQs(auAccs, params));
}

export async function auAccSave(params) {
  return request.put(auAccs, {
    body: params,
  });
}
