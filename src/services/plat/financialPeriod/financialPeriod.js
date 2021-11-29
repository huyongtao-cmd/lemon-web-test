import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  financePeriod: {
    finPeriodAll,
    finPeriodInsert,
    finPeriodUpdate,
    finPeriodDetail,
    finPeriodByIdDelete,
    finYearAll,
  },
} = api.plat;

// ===========================财务期间管理===========================
// 财务期间列表
export async function finPeriodAllRq(params) {
  return request.get(toQs(finPeriodAll, params));
}

// 财务期间新增
export async function finPeriodInsertRq(params) {
  return request.post(finPeriodInsert, {
    body: params,
  });
}

// 财务期间详情
export async function finPeriodDetailRq(id) {
  return request.get(toUrl(finPeriodDetail, id));
}

// 财务期间修改
export async function finPeriodUpdateRq(params) {
  return request.put(finPeriodUpdate, {
    body: params,
  });
}

// 财务期间删除
export async function finPeriodByIdDeleteRq(payload) {
  return request.get(toUrl(finPeriodByIdDelete, payload));
}

// 财务期间年度下拉
export async function finYearAllRq() {
  return request.get(finYearAll);
}
