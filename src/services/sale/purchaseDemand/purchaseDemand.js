import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const { purchaseContract } = api.sale;

// 采购需求列表查询
export async function purchaseDemandListRq(params) {
  return request.get(toQs(purchaseContract.purchaseDemandList, params));
}
