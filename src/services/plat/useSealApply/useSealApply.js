import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { sealApply, sealApplyDetail } = api.plat.useSealApply;

// 新增
export async function sealApplyPost(params) {
  return request.post(sealApply, {
    body: params,
  });
}

// 修改
export async function sealApplyPut(params) {
  return request.put(sealApply, {
    body: params,
  });
}

// 详情
export async function sealApplyGet(payload) {
  return request.get(toUrl(sealApplyDetail, payload));
}

// 删除
export async function sealApplyPatch(id) {
  return request.patch(toUrl(sealApply, id));
}
