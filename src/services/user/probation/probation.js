import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { res } = api.plat;
const {
  getResults,
  checkresultSave,
  checkresult,
  evalGetPoint,
  saveEvals,
  saveMid,
  saveFinal,
  deleteApi,
  detail,
  list,
  getCapacityList,
} = api.user.probation;

// 获取资源详情
export async function findResById(id) {
  return request.get(toUrl(res, { id }));
}

// 根据被考核资源id获取 末期考核流程检查事项及结果
export async function getResultsRq(parmars) {
  return request.get(toQs(getResults, parmars));
}

// 检查结果的保存
export async function checkresultSaveRq(params) {
  return request.post(checkresultSave, {
    body: params,
  });
}

// 拉取项目结项流程检查事项及结果
export async function checkresultRq(params) {
  const { id, chkClass } = params;
  return request.get(toQs(toUrl(checkresult, { id }), { chkClass }));
}

// 获取评价点信息
export async function evalGetPointRq(parmars) {
  return request.get(toQs(evalGetPoint, parmars));
}

// 保存平价点信息
export async function saveEvalsRq(params) {
  return request.post(saveEvals, {
    body: params,
  });
}

// 中期考核 保存:新增+修改；发起流程+推流程
export async function saveMidRq(params) {
  return request.put(saveMid, {
    body: params,
  });
}

// 末期考核 保存:新增+修改；发起流程+推流程
export async function saveFinalRq(params) {
  return request.put(saveFinal, {
    body: params,
  });
}

// 考核流程内获取复合能力列表
export async function getCapacityListRq(parmars) {
  return request.get(toQs(getCapacityList, parmars));
}

// 删除
export async function deleteApiRq(ids) {
  return request.patch(toUrl(deleteApi, ids));
}

// 详情
export async function detailRq(ids) {
  return request.get(toUrl(detail, ids));
}

// 列表
export async function listRq(params) {
  return request.get(toQs(list, params));
}
