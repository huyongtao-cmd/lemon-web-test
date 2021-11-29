import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  prefexamList,
  prefexamDetail,
  preexamPlanList,
  preexamContentDetail,
  assessedSave,
  assessorSave,
  hrSave,
  checkassessed,
  planExamById,
  communicateInfo,
} = api.plat.prefMgmt;

// 绩效考核沟通列表
export async function prefexamListRq(params) {
  return request.get(toQs(prefexamList, params));
}
// 绩效考核沟通详情
export async function prefexamDetailRq(id) {
  return request.get(toUrl(prefexamDetail, id));
}
// 绩效考核计划沟通明细
export async function preexamPlanListRq(payload) {
  return request.get(toQs(preexamPlanList, payload));
}
// 绩效考核沟通内容详情
export async function preexamContentDetailRq(payload) {
  return request.get(toQs(preexamContentDetail, payload));
}

// 绩效考核沟通流程被考核人填写
export async function assessedSaveRq(params) {
  return request.post(assessedSave, {
    body: params,
  });
}
// 绩效考核沟通流程考核人填写
export async function assessorSaveRq(params) {
  return request.post(assessorSave, {
    body: params,
  });
}
//  绩效考核沟通流程hr填写
export async function hrSaveRq(params) {
  return request.post(hrSave, {
    body: params,
  });
}

// 查看被考核人填写内容
export async function checkassessedRq(params) {
  return request.get(toQs(checkassessed, params));
}
// 查看考核计划
export async function planExamByIdRq(payload) {
  return request.get(toQs(planExamById, payload));
}
// 流程创建节点的沟通信息
export async function communicateInfoRq(payload) {
  return request.get(toUrl(communicateInfo, payload));
}
