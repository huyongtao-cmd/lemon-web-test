import api from '@/api';
import { toQs } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { addressList } = api.user.center;

export async function queryAddressList(params) {
  return request.get(toQs(addressList)(params));
}
