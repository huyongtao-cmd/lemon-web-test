import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { eqvaCosts, eqvaCost, eqvaCostDel, finyearsSelect, finperiodsSelect } = api.sys;

export async function findEqvaCostList(params) {
  return request.get(toQs(eqvaCosts, params));
}

export async function eqvaCostCreate(params) {
  return request.post(eqvaCosts, {
    body: params,
  });
}

export async function eqvaCostUpdate(params) {
  return request.put(toUrl(eqvaCost, { id: params.id }), {
    body: params,
  });
}

export async function deleteEqvaCosts(ids) {
  return request.patch(toUrl(eqvaCostDel, { ids: ids.join(',') }));
}

export async function selectFinyears() {
  return request.get(finyearsSelect);
}

export async function selectFinperiods(finYear) {
  return request.get(toUrl(finperiodsSelect, { finYear }));
}
