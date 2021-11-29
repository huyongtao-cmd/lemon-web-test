import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  prefMgmt: { examFinallyList, examByIdResDetail, examByIdView, myExamFinallyList },
} = api.plat;

// ===========================绩效考核结果===========================
// 绩效考核结果列表
export async function examFinallyListRq(params) {
  return request.get(toQs(examFinallyList, params));
}

// 个人工作台下考核结果列表
export async function myExamFinallyListRq(params) {
  return request.get(toQs(myExamFinallyList, params));
}

// 绩效考核结果详情
export async function examByIdViewRq(id) {
  return request.get(toUrl(examByIdView, id));
}

// 绩效考核结果明细
export async function examByIdResDetailRq(id) {
  return request.get(toUrl(examByIdResDetail, id));
}
