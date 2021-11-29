import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  getBuList,
  getBuInfo,
  getOkrInfo,
  getRankInfo,
  getOkrList,
  getWorkPlanList,
  getReportList,
  getExamList,
  getBuMember,
  getMenu,
} = api.org;

export async function getBuListFn(params) {
  return request.get(toQs(getBuList, params));
}
export async function getMenuFn(params) {
  return request.get(toQs(getMenu, params));
}

export async function getBuInfoFn(params) {
  return request.get(toQs(getBuInfo, params));
}

export async function getOkrInfoFn(params) {
  return request.get(toQs(getOkrInfo, params));
}

export async function getRankInfoFn(params) {
  return request.get(toQs(getRankInfo, params));
}

export async function getOkrListFn(params) {
  return request.get(toQs(getOkrList, params));
}

export async function getWorkPlanListFn(params) {
  return request.get(toQs(getWorkPlanList, params));
}

export async function getReportListFn(params) {
  return request.get(toQs(getReportList, params));
}

export async function getExamListFn(params) {
  return request.get(toQs(getExamList, params));
}

export async function getBuMemberFn(params) {
  return request.get(toQs(getBuMember, params));
}
