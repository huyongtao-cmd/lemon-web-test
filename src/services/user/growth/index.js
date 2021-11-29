import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  growthInfo,
  capaInfo,
  capaAttention,
  capaAttentionCancel,
  leveldInfo,
  leveldDiff,
  courseApply,
  getCourseApply,
  courseApplyHandle,
  saveCert,
  getCert,
  applyCert,
  checkPoint,
  savePoint,
  getPoint,
  getCapa,
  saveCapa,
  getCapaApplyInfo,
  flowPoint,
  flowCert,
  flowCapa,
  saveCapaGrowth,
  courseApplyList,
  certApplyList,
  examApplyList,
  capaSetApplyList,
  selectProj,
  selectProjRole,
  selectTaskEval,
  capaAccEssView,
  submitCapaAccEssView,
  capaAccEssViewById,
  capaAccEssViewFlow,
  resAccEssApplyList,
} = api.user.center;

export async function queryGrowthInfo() {
  return request.get(growthInfo);
}

export async function queryCapaInfo() {
  return request.get(capaInfo);
}

export async function capaAttentionCancelFn(id) {
  return request.get(toUrl(capaAttentionCancel, { id }));
}

export async function capaAttentionFn(params) {
  return request.put(capaAttention, {
    body: params,
  });
}

export async function getLeveldInfo(params) {
  return request.get(toUrl(leveldInfo, params));
}

export async function leveldDiffFn(params) {
  return request.put(leveldDiff, {
    body: params,
  });
}

export async function courseApplyFn(params) {
  return request.put(courseApply, {
    body: params,
  });
}

export async function getCourseApplyFn(id) {
  return request.get(toUrl(getCourseApply, { id }));
}

export async function courseApplyHandleFn(params) {
  return request.put(courseApplyHandle, {
    body: params,
  });
}

export async function saveCertFn(params) {
  return request.post(saveCert, {
    body: params,
  });
}

export async function getCertFn(id) {
  return request.get(toUrl(getCert, { id }));
}

export async function applyCertFn(params) {
  return request.put(applyCert, {
    body: params,
  });
}
// 跳转到考核点前的保存考核信息
export async function checkPointFn(params) {
  return request.post(checkPoint, {
    body: params,
  });
}
//  获取考核点
export async function getPointFn(id) {
  return request.get(toUrl(getPoint, { id }));
}
// 申请页面保存
export async function savePointFn(params) {
  return request.post(savePoint, {
    body: params,
  });
}

export async function getCapaFn(capaSetId) {
  return request.get(toUrl(getCapa, { capaSetId }));
}

export async function saveCapaFn(params) {
  return request.post(saveCapa, {
    body: params,
  });
}

export async function getCapaApplyInfoFn(id) {
  return request.get(toUrl(getCapaApplyInfo, { id }));
}
export async function flowPointFn(params) {
  return request.post(flowPoint, {
    body: params,
  });
}

export async function flowCertFn(params) {
  return request.put(flowCert, {
    body: params,
  });
}
export async function flowCapaFn(params) {
  return request.post(flowCapa, {
    body: params,
  });
}
export async function saveCapaGrowthFn(params) {
  return request.post(saveCapaGrowth, {
    body: params,
  });
}

// 培训课程权限申请记录
export async function getCourseApplyList(params) {
  return request.get(toQs(courseApplyList, params));
}

// 资格证书上传申请记录
export async function getCertApplyList(params) {
  return request.get(toQs(certApplyList, params));
}

// 考核点审核申请记录
export async function getExamApplyList(params) {
  return request.get(toQs(examApplyList, params));
}

// 能力获取申请记录
export async function getCapaSetApplyList(params) {
  return request.get(toQs(capaSetApplyList, params));
}

// 能力权限申请记录
export async function getResAccEssApplyList(params) {
  return request.get(toQs(resAccEssApplyList, params));
}

export async function getSelectProj() {
  return request.get(selectProj);
}

export async function getSelectProjRole(id) {
  return request.get(toUrl(selectProjRole, { id }));
}

export async function getSelectTaskEval() {
  return request.get(selectTaskEval);
}

export async function getCapaAccEssView(id) {
  return request.get(toUrl(capaAccEssView, { id }));
}

export async function submitCapaAccEssViewFn(params) {
  return request.post(submitCapaAccEssView, {
    body: params,
  });
}

export async function getCapaAccEssViewById(id) {
  return request.get(toUrl(capaAccEssViewById, { id }));
}

export async function capaAccEssViewFlowFn(params) {
  return request.post(capaAccEssViewFlow, {
    body: params,
  });
}
