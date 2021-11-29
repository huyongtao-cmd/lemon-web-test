import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { cmsList, cmsDetail, cms, cmsDelete } = api.sys;

export async function queryCmsList(params) {
  return request.get(toQs(cmsList, params));
}

export async function createCms(params) {
  return request(cms, {
    method: 'POST',
    body: params,
  });
}

export async function detailCms(id) {
  return request.get(toUrl(cmsDetail, { id }));
}

export async function editCms(params) {
  return request.put(cms, {
    body: params,
  });
}

export async function deleteCms(ids) {
  const url = ids.join(',');
  return request.delete(toUrl(cmsDelete, { ids: url }));
}
