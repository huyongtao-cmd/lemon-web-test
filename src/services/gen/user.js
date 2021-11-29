import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs } from '@/utils/stringUtils';

export async function queryUserPrincipal() {
  return request.get(api.basic.principal);
}
