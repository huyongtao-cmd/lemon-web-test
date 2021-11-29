import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { list } = api.plat.eval;

export async function evalList(params) {
  return request.get(toQs(list, params));
}

// export async function queryDitInfoDetail(id) {
//   return request.get(toUrl(detail, { id }));
// }
