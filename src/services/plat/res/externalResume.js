import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { fileToOut, fileToOutDate } = api.plat;

// 对外简历列表
export async function queryFileToOutList(params) {
  return request.get(toQs(fileToOut, params));
}

// fileToOutDate
export async function queryfileToOutDate(params) {
  return request.put(toUrl(fileToOutDate, { id: params }));
}
