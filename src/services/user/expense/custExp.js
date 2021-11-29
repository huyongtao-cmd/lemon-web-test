import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  custExpList,
  custExpDetail,
  custExpSaveForm,
  custExpDetailById,
  custExpSyncInfo,
  custExpCancel,
  custExpUpdateRecv,
} = api.user.project;

export async function queryCustExpList(params) {
  return request.get(toQs(custExpList, params));
}

export async function queryCustExpDetail(ids, id) {
  return request.get(toUrl(custExpDetail, { ids, id }));
}

export async function saveCustExpForm(params) {
  return request.put(custExpSaveForm, {
    body: params,
  });
}

export async function queryCustExpDetailById(id) {
  return request.get(toUrl(custExpDetailById, { id }));
}

export async function syncCustExpInfo() {
  return request.get(custExpSyncInfo);
}

export async function cancelCustExp(params) {
  return request.get(toUrl(custExpCancel, params));
}

export async function updateCustExpRecv(params) {
  return request.put(custExpUpdateRecv, {
    body: params,
  });
}
