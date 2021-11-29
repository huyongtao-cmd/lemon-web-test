import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { resFindList } = api.user.resMgt;

export async function queryResFindList(params) {
  return request.get(toQs(resFindList, params));
}
