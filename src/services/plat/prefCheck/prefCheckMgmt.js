import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  prefMgmt: {
    examTmplList,
    examTmplDetails,
    examTmplCreate,
    examTmplEdit,
    examTmplDelete,
    examTmplChangeStatus,
  },
} = api.plat;

// ===========================绩效考核模板===========================
// 绩效考核模板列表
export async function examTmplListRq(params) {
  return request.get(toQs(examTmplList, params));
}

// 新增绩效考核模板
export async function examTmplCreateRq(params) {
  return request.post(examTmplCreate, {
    body: params,
  });
}

// 绩效考核模板详情
export async function examTmplDetailsRq(id) {
  return request.get(toUrl(examTmplDetails, id));
}

// 修改绩效考核模板
export async function examTmplEditRq(params) {
  return request.post(examTmplEdit, {
    body: params,
  });
}

// 绩效考核模板删除
export async function examTmplDeleteRq(payload) {
  return request.post(toUrl(examTmplDelete, payload));
}

// 绩效考核模板状态更改
export async function examTmplChangeStatusRq(parmars) {
  return request.get(toUrl(examTmplChangeStatus, parmars));
}
