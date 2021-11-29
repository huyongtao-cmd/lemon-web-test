import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  getBaseBuInfo,
  saveBaseBUInfoUri,
  getBaseViewListUri,
  newBaseBuUserPassUri,
  oldBaseBuUserPassUri,
  newBasePUserPassUri,
  newBaseMyUserPassUri,
  newBaseMyUserUri,
  newBaseHrUri,
  newBaseHrPassUri,
  submitBaseBUInfoUri,
} = api.plat.BaseBUChange;

// 根据资源id查找信息
export async function baseBuInfo(id) {
  return request.get(toUrl(getBaseBuInfo, { id }));
}

// 保存页面信息
export async function saveBaseBUInfo(params) {
  return request.put(saveBaseBUInfoUri, {
    body: params,
  });
}

// 获取详情
export async function getBaseViewList(id) {
  return request.get(toUrl(getBaseViewListUri, { id }));
}

// 原BaseBU上级通过拒绝
export async function newBaseBUserPass(params) {
  return request.put(newBaseBuUserPassUri, {
    body: params,
  });
}

// 原BaseBU领导通过拒绝
export async function oldBaseBuUserPass(params) {
  return request.put(oldBaseBuUserPassUri, {
    body: params,
  });
}

// 新BaseBU上级领导修改
export async function newBasePUserPass(params) {
  return request.put(newBasePUserPassUri, {
    body: params,
  });
}

// 自己审批时通过与不通过
export async function newBaseMyUserPass(params) {
  return request.put(newBaseMyUserPassUri, {
    body: params,
  });
}

// 自己审批时获取检查事项
export async function newBaseMyUser(id) {
  return request.get(toUrl(newBaseMyUserUri, { id }));
}

// Hr审批时获取检查事项
export async function newBaseHr(id) {
  return request.get(toUrl(newBaseHrUri, { id }));
}

// HR审批时通过与不通过
export async function newBaseHrPass(params) {
  return request.put(newBaseHrPassUri, {
    body: params,
  });
}

export async function submitBaseBUInfo(params) {
  return request.put(submitBaseBUInfoUri, {
    body: params,
  });
}
