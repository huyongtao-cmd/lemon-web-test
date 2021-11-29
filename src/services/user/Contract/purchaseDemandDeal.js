import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  procurDemandDetail,
  procurDemandEdit,
  insertPurConMan,
  insertPurConManModify,
} = api.user.contract;

// 采购需求详情查询
export async function procurDemandDetailRq(params) {
  return request.get(toUrl(procurDemandDetail, params));
}

// 采购需求新增/修改
export async function procurDemandEditRq(params) {
  return request.post(procurDemandEdit, {
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
