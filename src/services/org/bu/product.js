import api from '@/api';
import { toQs } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { buProduct } = api.org;

export async function queryProdList(params) {
  return request.get(toQs(buProduct, params));
}
