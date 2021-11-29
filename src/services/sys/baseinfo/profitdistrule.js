import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { profitdistRules, profitdistRule, profitdistRuleDel } = api.sys;

export async function findProfitdistRuleList(params) {
  return request.get(toQs(profitdistRules, params));
}

export async function findProfitdistRuleById(id) {
  return request.get(toUrl(profitdistRule, { id }));
}

export async function create(params) {
  return request.post(profitdistRules, {
    body: params,
  });
}

export async function update(params) {
  return request.put(toUrl(profitdistRule, { id: params.id }), {
    body: params,
  });
}

export async function deleteProfitdistRules(ids) {
  return request.patch(toUrl(profitdistRuleDel, { ids: ids.join(',') }));
}
