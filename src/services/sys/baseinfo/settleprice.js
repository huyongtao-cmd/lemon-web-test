import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { settlePrices, settlePrice, settlePriceDel } = api.sys;

export async function findSettlePriceList(params) {
  return request.get(toQs(settlePrices, params));
}

export async function settlePriceCreate(params) {
  return request.post(settlePrices, {
    body: params,
  });
}

export async function settlePriceUpdate(params) {
  return request.put(toUrl(settlePrice, { id: params.id }), {
    body: params,
  });
}

export async function deleteSettlePrices(ids) {
  return request.patch(toUrl(settlePriceDel, { ids: ids.join(',') }));
}
