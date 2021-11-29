import { request } from '@/utils/networkUtils';
import { toUrl } from '@/utils/stringUtils';
import api from '@/api';

export async function queryProvince() {
  return request(api.demo.province, { mock: 1 });
}

export async function queryCity(province) {
  // console.log('url ->', toUrl(api.demo.city, province));
  return request(toUrl(api.demo.city, province), { mock: 1 });
}
