import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  evalMainId,
  evalMainList,
  evalMainSave,
  evalPointId,
  evalPointList,
  evalPointSave,
  evalPointselect,
  evalPointStatus,
} = api.sys.eval;

export async function queryEvalMainId(id) {
  return request.get(toUrl(evalMainId, { id }));
}

export async function queryEvalMainList(params) {
  return request.get(toQs(evalMainList, params));
}

export async function saveEvalMain(params) {
  return request.post(evalMainSave, {
    body: params,
  });
}

export async function selectEvalPoint() {
  return request.get(evalPointselect);
}

// 评论点
export async function queryEvalPointId(id) {
  return request.get(toUrl(evalPointId, { id }));
}

export async function queryEvalPointList(params) {
  return request.get(toQs(evalPointList, params));
}

export async function saveEvalPoint(params) {
  return request.post(evalPointSave, {
    body: params,
  });
}

export async function changeStatus(params) {
  return request.put(toUrl(evalPointStatus, params));
}
