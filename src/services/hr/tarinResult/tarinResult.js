import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  tarinResult: { tarinResultList, tarinResultClose, updateEnddate, updateLearningPro },
} = api.hr;

// ===========================资源培训情况===========================

// ================资源培训情况列表==================
// 资源培训情况列表
export async function tarinResultListRq(params) {
  return request.get(toQs(tarinResultList, params));
}

// 资源培训情况列表关闭
export async function tarinResultCloseRq(params) {
  return request.get(toUrl(tarinResultClose, params));
}

// 修改截止日期
export async function updateEnddateRq(parmars) {
  return request.put(updateEnddate, {
    body: parmars,
  });
}
// 更新学习进度
export async function updateLearningProRq(parmars) {
  return request.put(toUrl(updateLearningPro, parmars));
}
