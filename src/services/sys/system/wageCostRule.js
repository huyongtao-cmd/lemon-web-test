import { request } from '@/utils/networkUtils';
import api from '@/api';
// import { toQs, toUrl } from '@/utils/stringUtils';

const { getCostRuleCfg, postCostRuleCfg, costRuleAbSupp } = api.sys.system;

export async function queryCostRuleCfg() {
  return request.get(getCostRuleCfg);
}

export async function saveCostRuleCfg(params) {
  return request(postCostRuleCfg, {
    method: 'POST',
    body: params,
  });
}

export async function getcostRuleAbSupp() {
  return request.get(costRuleAbSupp);
}
