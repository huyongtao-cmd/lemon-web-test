import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

// 明细数据查询
export async function detaulQuery(params) {
  return request.get(toQs(api.plat.wageCostDetail.detaulQuery, params));
}
// 付款对象查询
export async function payObjQuery(params) {
  return request.get(toQs(api.plat.wageCostDetail.payObjQuery, params));
}
// BU查询
export async function buQuery(params) {
  return request.get(toQs(api.plat.wageCostDetail.buQuery, params));
}
