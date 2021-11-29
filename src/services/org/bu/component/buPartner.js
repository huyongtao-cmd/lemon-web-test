import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { bupartner, bupartnersave } = api.org;

export async function findByBuId({ buId }) {
  return request(toUrl(bupartner, { buId }), {
    method: 'GET',
  });
}

export async function savePartnerByBuId(id, params) {
  return request(toUrl(bupartnersave, { buId: id }), {
    method: 'PUT',
    body: params,
  });
}
