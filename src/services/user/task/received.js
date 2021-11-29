import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  receivedTasks,
  startResAct,
  finishResAct,
  receivedSubpack,
  subpackProcess,
  receivedSubpackDetail,
  receivedBuSubpackDetail,
  completeProc,
  checkTaskEqvaByTaskId,
} = api.user.task;

export async function queryReceivedTasks(params) {
  return request.get(toQs(receivedTasks, params));
}

export async function startResActivity(params) {
  return request.put(toUrl(startResAct, params));
}

export async function finishResActivity(params) {
  return request.put(toQs(finishResAct, params));
}

export async function submitSubpack(params) {
  return request.put(receivedSubpack, {
    body: params,
  });
}

export async function processSubpack(id) {
  return request.post(toUrl(subpackProcess, { id }));
}

export async function querySubpackDetail(id) {
  return request.get(toUrl(receivedSubpackDetail, { id }));
}

// 到bu负责人时需要查询的信息
export async function queryBuSubpackDetail(id) {
  return request.get(toUrl(receivedBuSubpackDetail, { id }));
}

export async function checkTaskEqva(id) {
  return request.get(toUrl(checkTaskEqvaByTaskId, { id }));
}

export async function startCompleteProc(param) {
  return request.post(toUrl(completeProc, param));
}
