import api from '@/api';
import { toUrl, toQs } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { evald, createEvalInfo, hasEval, getEvaldHistory, getEvalInfo, timeout } = api.eval;

export async function queryEvalInfo(params) {
  return request.get(toQs(createEvalInfo, params));
}
export async function submitEval(params) {
  return request.post(evald, {
    body: params,
  });
}
export async function isEval(params) {
  return request.get(toQs(hasEval, params));
}
export async function queryEvalList(params) {
  return request.get(toQs(getEvaldHistory, params));
}
export async function queryEvalDetail(id) {
  return request.get(toUrl(getEvalInfo, { id }));
}
