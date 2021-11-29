import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  resCapaPost,
  resCapaReview,
  capaAbility,
  waitCapaAbility,
  saveResTrainingProg,
  mycapaSetList,
  mycapaSetChecked,
  resCapaType,
  myResCapa,
  myFocusResCapa,
  cancelMyResCapa,
  saveMyResCapa,
} = api.user.center;

// 添加关注
export async function saveMyResCapaRq(params) {
  return request.post(saveMyResCapa, {
    body: params,
  });
}

// 取消关注
export async function cancelMyResCapaRq(params) {
  return request.delete(toUrl(cancelMyResCapa, params));
}

// 我关注的单项能力分类-点击获取考核点
export async function myFocusResCapaRq(params) {
  return request.get(toUrl(myFocusResCapa, params));
}

// 我的单项能力分类-点击获取考核点
export async function myResCapaRq(params) {
  return request.get(toUrl(myResCapa, params));
}

// 我的单项能力分类
export async function resCapaTypeRq(params) {
  return request.get(toUrl(resCapaType, params));
}

// 我的复核能力考核点
export async function mycapaSetCheckedRq(params) {
  return request.get(toUrl(mycapaSetChecked, params));
}

// 我的复核能力
export async function mycapaSetListRq(params) {
  return request.get(toQs(mycapaSetList, params));
}

// ==================我的赋能 - 考核中能力============
// 新增项目培训
export async function saveResTrainingProgRq(params) {
  return request.post(saveResTrainingProg, {
    body: params,
  });
}

// 待复核考核点
export async function waitCapaAbilityRq(params) {
  return request.get(toQs(waitCapaAbility, params));
}

// 试岗考核点
export async function capaAbilityRq(params) {
  return request.get(toQs(capaAbility, params));
}

// 待复核
export async function resCapaReviewRq(params) {
  return request.get(toUrl(resCapaReview, params));
}

// 试岗考核中
export async function resCapaPostRq(params) {
  return request.get(toUrl(resCapaPost, params));
}
