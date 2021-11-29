import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { customer } = api.user;
const {
  customerList,
  changeDist,
  customerDetails,
  customerSave,
  seletePicById,
  customerFuzzyList,
  signInvalid,
  customerUpload,
} = customer;

// 潜在客户列表
export async function customerListRq(params) {
  return request.get(toQs(customerList, params));
}

// 派发管理
export async function changeDistRq(params) {
  const { ids } = params;
  return request.put(toUrl(changeDist, { ids }), {
    body: params,
  });
}

// 潜在客户详情
export async function customerDetailsRq(params) {
  return request.get(toUrl(customerDetails, { id: params }));
}

// 新增潜在客户
export async function customerSaveRq(params) {
  return request.put(customerSave, {
    body: params,
  });
}

// 查询pic负责人
export async function seletePicByIdRq(params) {
  return request.get(toUrl(seletePicById, { id: params }));
}

// 潜在客户模糊查重
export async function customerFuzzyListRq(params) {
  return request.get(toQs(customerFuzzyList, params));
}

// 潜在客户标记为无效
export async function signInvalidRq(params) {
  return request.put(toUrl(signInvalid, { ids: params }));
}

// 导入excel潜在客户数据
export async function customerUploadRq(params) {
  return request.post(customerUpload, {
    body: params,
  });
}
