/* eslint-disable no-redeclare */
import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { findBuReimbursementList, checkReimbursement, getCostSharing, costSharing } = api.org;
const { launchFlow } = api.flowHandle;

// 查询报销单列表
export async function getBuReimbursementList(params) {
  const temp = {};
  Object.keys(params).forEach(key => {
    if (params[key]) {
      temp[key] = params[key];
    }
  });
  return request.get(toQs(findBuReimbursementList, temp));
}

// 根据费用报销单id校验
export async function checkReimbursementById(id) {
  return request.get(toUrl(checkReimbursement, { id }));
}

// 查询分摊明细
export async function getCostSharingById(id) {
  return request.get(toUrl(getCostSharing, { id }));
}

// 插入分摊明细
export async function postCostSharing(data) {
  return request.post(costSharing, { body: data });
}
