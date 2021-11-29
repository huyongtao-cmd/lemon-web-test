import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { bueqva, bueqvasaveBy, bueqvaDel, bueqvaUri } = api.org;

export async function findByBuId(params) {
  return request(toQs(toUrl(bueqva, params), params), {
    method: 'GET',
  });
}

export async function saveEqvaByBuId(params) {
  return request(toUrl(bueqvasaveBy, { buId: params.buId }), {
    method: 'PUT',
    body: params,
  });
}

export async function deleteBueqvaList(ids) {
  return request.patch(toUrl(bueqvaDel, { ids: ids.join(',') }));
}

export async function findByCondition(params) {
  return request.get(toQs(bueqvaUri, params));
}
