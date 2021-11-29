import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { recruit, recruitDetail, recruitDelete } = api.plat;

// 招聘岗位列表
export async function recruitList(params) {
  return request.get(toQs(recruit, params));
}

// 新增招聘岗位
export async function recruitCreateRq(params) {
  return request.post(recruit, {
    body: params,
  });
}

// 招聘岗位详情
export async function recruitDetailRq(id) {
  return request.get(toUrl(recruitDetail, id));
}

// 招聘岗位修改
export async function recruitEditRq(params) {
  return request.put(recruit, {
    body: params,
  });
}

// 招聘岗位删除
export async function recruitDeleteRq(payload) {
  const { ids } = payload;
  return request.patch(toUrl(recruitDelete, payload));
}
