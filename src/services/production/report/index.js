import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { report } = api.production;

export async function projectReportPaging(param) {
  return request.get(toQs(report.projectReportPagingUri, param));
}

export async function productReportPaging(param) {
  return request.get(toQs(report.productReportPagingUri, param));
}

export async function departmentReportPaging(param) {
  return request.get(toQs(report.departmentReportPagingUri, param));
}

export async function specialProjectReportPaging(param) {
  return request.get(toQs(report.specialReportPagingUri, param));
}
