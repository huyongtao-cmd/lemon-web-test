import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  vacationMgmt,
  vacationMgmtDelete,
  vacationDetail,
  vacationApply,
  vacationApplyDetail,
  vacationUpload,
  vacationBuList,
  queryTemporaryTimeUri,
  saveTemporaryTimeUri,
  batchSaveTemporaryTimeUri,
} = api.plat.vacation;

// 假期管理列表
export async function vacationList(params) {
  return request.get(toQs(vacationMgmt, params));
}

// BU假期管理列表
export async function myBuVacationList(params) {
  return request.get(toQs(vacationBuList, params));
}

// 新增假期
export async function vacationCreateRq(params) {
  return request.post(vacationMgmt, {
    body: params,
  });
}
// 修改假期
export async function vacationEditRq(params) {
  return request.put(vacationMgmt, {
    body: params,
  });
}
// 假期详情
export async function vacationDetailRq(id) {
  return request.get(toUrl(vacationDetail, id));
}

// 假期删除
export async function vacationDeleteRq(payload) {
  const { ids } = payload;
  return request.patch(toUrl(vacationMgmtDelete, payload));
}

// 假期申请列表
export async function vacationApplyList(params) {
  return request.get(toQs(vacationApply, params));
}

// 假期申请详情
export async function vacationApplyDetailRq(id) {
  return request.get(toUrl(vacationApplyDetail, id));
}

// 导入excel假期
export async function vacationUploadRq(params) {
  return request.post(vacationUpload, {
    body: params,
  });
}
// 参数配置弹窗查询出有效期
export async function queryTemporaryTime(params) {
  return request.get(toQs(queryTemporaryTimeUri, params));
}

// 参数配置弹窗保存有效期
export async function saveTemporaryTime(params) {
  return request.patch(saveTemporaryTimeUri, {
    body: params,
  });
}
// 批量修改有效期
export async function batchSaveTemporaryTime(params) {
  return request.put(toUrl(batchSaveTemporaryTimeUri, { ids: params.ids }), {
    body: {
      expirationDate: params.expirationDate,
    },
  });
}
