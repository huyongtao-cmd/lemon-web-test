/* eslint-disable no-redeclare */
import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  regularCareLists,
  regularCareCreate,
  regularDelete,
  omCareConfigById,
  vewRegularList,
  regularListDetail,
  regularListDetailById,
  regularFeedBackById,
  regularFeedBack,
  regularDeleteList,
  generateListDetail,
} = api.regularCare;

// 根据筛选条件获取客户关怀事项
export async function getRegularCareList(params) {
  return request.get(toQs(regularCareLists, params));
}

// 根据id获取新增客户关怀详情
export async function getCareDetailById(id) {
  return request.get(toUrl(omCareConfigById, { id }));
}

// 新增客户关怀
export async function createRegularCareDetail(data) {
  return request.post(regularCareCreate, {
    body: data,
  });
}

// 删除客户关怀
export async function deleteRegular(data) {
  return request.patch(toUrl(regularDelete, data));
}

// 点击按钮，生成客户关怀明细
export async function generateDetail(data) {
  return request.patch(toUrl(generateListDetail, data));
}

// 根据id获取客户关怀明细
export async function getViewRegularList(id) {
  return request.get(toUrl(vewRegularList, { id }));
}

// 新增客户关怀明细
export async function createRegularListDetail(data) {
  return request.post(regularListDetail, {
    body: data,
  });
}

// 删除客户关怀明细
export async function deleteRegularList(data) {
  return request.patch(toUrl(regularDeleteList, data));
}

// 根据id获取客户关怀明细详情
export async function getRegularListDetailById(id) {
  return request.get(toUrl(regularListDetailById, { id }));
}

// 根据id获取客户关怀明细反馈
export async function getRegularFeedBackById(id) {
  return request.get(toUrl(regularFeedBackById, { id }));
}

// 反馈
export async function doRegularFeedBack(data) {
  return request.post(regularFeedBack, {
    body: data,
  });
}
