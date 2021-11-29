import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  prodClassesList,
  prodClassesTree,
  deleteProdClass,
  addProdClass,
  updateProdClass,
} = api.sys;

export async function queryProdClassesList(params) {
  return request.get(toQs(prodClassesList, params));
}

export async function queryProdClassesTree(params) {
  return request.get(prodClassesTree);
}

export async function deleteProdClasses(ids) {
  return request.patch(toQs(deleteProdClass, { ids: ids.join(',') }));
}

export async function addProdClasses(params) {
  return request.post(toQs(addProdClass, params));
}

export async function updateProdClasses(params) {
  return request.put(toQs(updateProdClass, params));
}
