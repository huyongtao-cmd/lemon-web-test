import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  subjtemplate,
  subjtemplates,
  subjtempDel,
  subjtempStatus,
  subjtemplateDetails,
  accMasTree,
} = api.sys;

export async function findSubjtemplates(params) {
  return request.get(toQs(subjtemplates, params));
}

export async function findSubjtemplateById(id) {
  return request.get(toUrl(subjtemplate, { id }));
}
export async function create(params) {
  return request.post(subjtemplates, {
    body: params,
  });
}

export async function update(params) {
  return request.put(toUrl(subjtemplate, { id: params.id }), {
    body: params,
  });
}

export async function deleteSubjtemplate(ids) {
  return request.patch(toUrl(subjtempDel, { ids: ids.join(',') }));
}

export async function updateSubjtempStatus(params) {
  return request.patch(toUrl(subjtempStatus, { ids: params.id.join(','), status: params.statu }));
}

// 科目模版子表
export async function findSubjtemplateDetails(params) {
  return request.get(toQs(subjtemplateDetails, { tmplId: params.tmplId }));
}

// 财务模版树
export async function queryAccMasTree(params) {
  return request.get(toQs(accMasTree, params));
}
