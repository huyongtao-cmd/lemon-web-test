import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs } from '@/utils/stringUtils';

const { resWork, resDemand, timesheetReportList } = api.plat.reportMgmt;

export async function queryResWorkList(params) {
  return request.get(toQs(resWork, params));
}

export async function queryResDemand(params) {
  return request.get(toQs(resDemand, params));
}

export async function queryTSReportList(params) {
  return request.get(toQs(timesheetReportList, params));
}
