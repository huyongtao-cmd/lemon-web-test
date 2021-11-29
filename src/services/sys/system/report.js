import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  reportNav,
  getRelated,
  getParam,
  reportList,
  reportSave,
  reportDetail,
  reportDelete,
  reportSelect,
  roleCodeSelect,
  roleList,
  roleSave,
  reportUpload,
  reportBaseUrl,
} = api.sys.report;

// 展示
export async function queryReportNav() {
  return request.get(reportNav);
}

export async function queryRelated(id) {
  return request.get(toUrl(getRelated, { id }));
}

export async function queryParam(code) {
  return request.get(toUrl(getParam, { code }));
}

// 维护
export async function queryReportList(params) {
  return request.get(toQs(reportList, params));
}

export async function saveReport(params) {
  return request.put(reportSave, {
    body: params,
  });
}

export async function queryReportDetail(reportId) {
  return request.get(toUrl(reportDetail, { reportId }));
}

export async function deleteReport(ids) {
  return request.delete(toUrl(reportDelete, { ids }));
}

export async function selectReport() {
  return request.get(reportSelect);
}

export async function selectRoleCode() {
  return request.get(roleCodeSelect);
}

export async function queryRoleList(params) {
  return request.get(toUrl(roleList, params));
}

export async function queryReportBaseUrl(params) {
  return request.get(toUrl(reportBaseUrl, params));
}

export async function saveRole(params, roles) {
  return request.put(toUrl(roleSave, params), {
    body: roles,
  });
}

// 进项税自动抵扣
export async function uploadReport(params) {
  return request.post(reportUpload, {
    body: params,
  });
}
