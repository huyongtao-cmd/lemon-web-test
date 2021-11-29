import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  getExamTmpl,
  examRes,
  exam,
  examlist,
  examById,
  examByIdResList,
  roleList,
  examListChangeStatus,
  examCopyDetails,
  flowDetail,
  examineByThree,
  examineByFour,
  gradeExam,
  examCreateReview,
  createPlanComm,
  checkIsPerformanceExam,
  assessorById,
} = api.plat.prefMgmt;

// 获取已启用的考核模板
export async function getExamTmplRq() {
  return request.get(getExamTmpl);
}

// 获取需要考核的资源信息
export async function examResRq(params) {
  return request.get(toQs(examRes, params));
}

// 添加考核信息
export async function examRq(params) {
  return request.post(exam, {
    body: params,
  });
}

// 考核信息列表
export async function examlistRq(params) {
  return request.get(toQs(examlist, params));
}

// 考核信息列表详情
export async function examByIdRq(params) {
  return request.get(toUrl(examById, params));
}
// 获取考核人资源id
export async function assessorByIdRq(params) {
  return request.get(toUrl(assessorById, params));
}

// 考核信息列表详情的资源列表
export async function examByIdResListRq(params) {
  const { id, ...newParams } = params;
  return request.get(toQs(toUrl(examByIdResList, { id }), newParams));
}

// 考核范围查询条件角色下拉
export async function roleListRq(params) {
  return request.get(toQs(roleList, params));
}

// 考核信息列表状态更改
export async function examListChangeStatusRq(parmars) {
  return request.put(toUrl(examListChangeStatus, parmars));
}

// 考核信息列表拷贝详情
export async function examCopyDetailsRq(params) {
  return request.get(toUrl(examCopyDetails, params));
}

// 流程详情
export async function flowDetailRq(params) {
  return request.get(toUrl(flowDetail, params));
}

// 绩效考核第三节点审批
export async function examineByThreeRq(params) {
  const { taskId, ...newParams } = params;
  return request.post(toUrl(examineByThree, { taskId }), {
    body: newParams,
  });
}

// 绩效考核第四节点审批
export async function examineByFourRq(params) {
  const { taskId, ...newParams } = params;
  return request.post(toUrl(examineByFour, { taskId }), {
    body: newParams,
  });
}

// 绩效考核第四节点输入综合等级获取得分
export async function gradeExamRq(params) {
  return request.get(toUrl(gradeExam, params));
}

// 绩效考核列表发起考核
export async function examCreateReviewRq(params) {
  return request.post(toQs(examCreateReview, params));
}

// 绩效考核沟通流程创建页面
export async function createPlanCommRq(params) {
  return request.post(createPlanComm, {
    body: params,
  });
}
// 检查绩效考核沟通是否存在流程
export async function checkIsPerformanceExamRq(params) {
  return request.get(toQs(checkIsPerformanceExam, params));
}
