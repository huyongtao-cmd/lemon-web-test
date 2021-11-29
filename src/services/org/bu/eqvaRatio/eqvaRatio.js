import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { getOrgResInfo, getResRatioList, saveResRatio, getResEqvaList, saveResEqva } = api.org;

export async function getResInfo(payload) {
  return request.get(toUrl(getOrgResInfo, payload));
}

export async function getRatioList(payload) {
  return request.get(toUrl(getResRatioList, payload));
}

export async function saveRatio(payload) {
  return request.post(saveResRatio, { body: payload });
}

export async function getEqvaList(payload) {
  return request.get(toUrl(getResEqvaList, payload));
}

export async function saveEqva(payload) {
  return request.post(saveResEqva, { body: payload });
}
