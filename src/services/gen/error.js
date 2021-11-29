import { request } from '@/utils/networkUtils';

export default async function queryError(code) {
  return request(`/api/${code}`, { mock: 1 });
}
