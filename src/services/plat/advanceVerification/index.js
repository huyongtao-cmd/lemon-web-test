import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { list, advanceVerificationDetail, singleList, save } = api.plat.advanceVerification;

export async function queryAdvanceVerificationList(params) {
  return request.get(toQs(list, params));
}

export async function queryAdvanceVerificationDetail(id) {
  return request.get(toUrl(advanceVerificationDetail, { id }));
}
export async function querySingleList(id) {
  return request.get(toUrl(singleList, { id }));
}
// 保存报销付款数据，用于jde数据同步，保存加修改
export async function saveData(params) {
  return request.post(save, { body: params });
}
