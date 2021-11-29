import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  teamPersonal,
  teamInfo,
  resInfo,
  resPlanList,
  workingList,
  resAccountInfo,
  resAccountList,
  resAccountDetailList,
  vacationList,
} = api.user.center;

export async function queryTeamInfo(params) {
  return request.get(toQs(teamPersonal)(params));
}

export async function getTeamInfo(params) {
  return request.get(toQs(teamInfo)(params));
}

export async function queryResInfo(id) {
  return request.get(toUrl(resInfo, { id }));
}

export async function queryResPlanList(params) {
  return request.get(toQs(resPlanList, params));
}

export async function queryWorkingList(searchYear, id) {
  return request.get(toUrl(workingList, { searchYear, id }));
}

export async function queryResAccountInfo(resId) {
  return request.get(toUrl(resAccountInfo, { resId }));
}

export async function queryResAccountList(resId, params) {
  return request.get(toQs(toUrl(resAccountList, { resId }), params));
}

export async function queryResAccountDetailList(resId, params) {
  return request.get(toQs(toUrl(resAccountDetailList, { resId }), params));
}

export async function queryVacationList(params) {
  return request.get(toQs(vacationList, params));
}
