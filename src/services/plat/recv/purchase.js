import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { purchasePlan, purchasePlanPatchD } = api.user.contract;

export async function queryPlanList(params) {
  return request.get(toQs(purchasePlan, params));
}

export async function payPlanPatchDelete(ids) {
  return request.patch(toUrl(purchasePlanPatchD, { ids }));
}
