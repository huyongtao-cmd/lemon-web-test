import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  recvplanListSave,
  queryRecvplanList,
  recvPlanListPersonal,
  recvPurchasePersonal,
  recvDistInfo,
  recvDistInfoSave,
  getPeriodInfoByDate,
  recvConfSave,
} = api.user.contract;

export async function saveRecvplanList(id, params) {
  return request(toUrl(recvplanListSave, { id }), {
    method: 'PATCH',
    body: params,
  });
}

export async function recvplanList(params) {
  return request.get(toQs(queryRecvplanList, params));
}

// 合同收款计划查询 - 个人工作台权限下的查询
export async function getRecvplanListPersonal(params) {
  return request.get(toQs(recvPlanListPersonal, params));
}

// 付款计划查询 - 个人工作台权限下的查询
export async function getRecvPurchaseListPersonal(params) {
  return request.get(toQs(recvPurchasePersonal, params));
}

// 根据收款计划获取初始分配信息
export async function getDistInfoByReact(recvId) {
  return request.get(toUrl(recvDistInfo, { recvId }));
}

// 保存分配信息
export async function saveDistInfo(params) {
  const { recvId, ...newParams } = params;
  return request.post(toUrl(recvDistInfoSave, { recvId }), {
    body: newParams,
  });
}

// 根据时间拉取收入核算期间
export async function getPeriodInfoByDateRq(date) {
  return request.get(toUrl(getPeriodInfoByDate, { date }));
}

// 保存确认日期
export async function saveRecvConf(params) {
  return request.put(recvConfSave, { body: params });
}
