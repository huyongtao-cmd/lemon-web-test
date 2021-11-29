import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { internal, internalDelete, internalDetail } = api.plat;

// 内推资源列表
export async function internalList(params) {
  return request.get(toQs(internal, params));
}

// 新增内推资源
export async function internalCreateRq(params) {
  return request.post(internal, {
    body: params,
  });
}

// 内推资源删除
export async function internalDeleteRq(payload) {
  const { ids } = payload;
  return request.patch(toUrl(internalDelete, payload));
}

// 内推资源详情
export async function internalDetailRq(id) {
  return request.get(toUrl(internalDetail, id));
}

// 内推资源修改
export async function internalEditRq(params) {
  return request.put(internal, {
    body: params,
  });
}
