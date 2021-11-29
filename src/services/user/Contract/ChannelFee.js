import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  channelCostConDetail,
  channelCostConEdit,
  insertPurConMan,
  insertPurConManModify,
  subDetail,
} = api.user.contract;

// 子合同详情 - 从销售合同列表创建采购合同
export async function subDetailRq(params) {
  return request.get(toUrl(subDetail, params));
}

// 渠道费用确认单详情查询
export async function channelCostConDetailRq(params) {
  return request.get(toUrl(channelCostConDetail, params));
}

// 采购需求新增/修改
export async function channelCostConEditRq(params) {
  return request.post(channelCostConEdit, {
    body: params,
  });
}

// 生成采购合同
export async function insertPurConManRq(params) {
  return request.post(insertPurConMan, {
    body: params,
  });
}

// 生成后 调 采购合同那边的详情
export async function insertPurConManModifyRq(params) {
  return request.get(toUrl(insertPurConManModify, params));
}
