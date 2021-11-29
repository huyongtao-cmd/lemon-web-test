import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  equivalentCreateUri,
  equivalentDetailUri,
  queryTaskDetailUri,
  queryModalDetail,
  disterUserPassUri,
  queryCapasetLevelUri,
} = api.user.task;

// 当量申请新增和修改
export async function equivalentCreate(params) {
  return request.post(equivalentCreateUri, {
    body: params,
  });
}
// 当量申请详情
export async function equivalentDetailRq(id) {
  return request.get(toUrl(equivalentDetailUri, id));
}

// 当量申请流程的任务包结算页面
export async function queryTaskDetailUriRq(id) {
  return request.get(toUrl(queryTaskDetailUri, id));
}

// 结算预览弹窗
export async function queryModalDetailRq(params) {
  return request.get(toQs(queryModalDetail, params));
}

// 原发包人通过或拒绝
export async function disterUserPass(params) {
  return request.post(disterUserPassUri, {
    body: params,
  });
}

// 根据resI的查询复合能力
export async function queryCapasetLevelUriRq(resId) {
  return request.get(toUrl(queryCapasetLevelUri, resId));
}
