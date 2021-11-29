import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { buProdClass, buClassTree, buProdClassSave } = api.org;

export async function findBuProdClass(buId) {
  return request(toUrl(buProdClass, { buId }), {
    method: 'GET',
  });
}
export async function queryClassTree(params) {
  return request.get(toQs(buClassTree, params));
}

export async function createBuProdClass(id, params) {
  return request(toUrl(buProdClassSave, { buId: id }), {
    method: 'PUT',
    body: params,
  });
}
