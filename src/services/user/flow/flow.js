import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  todo,
  back,
  done,
  procs,
  procsAll,
  procCancel,
  notify,
  updateNotify,
  updateNotifyBatch,
  closeFlow,
} = api.user.flow;

export async function getTodo(params) {
  return request.get(toQs(todo, params));
}

export async function getBack(params) {
  return request.get(toQs(back, params));
}

export async function getDone(params) {
  return request.get(toQs(done, params));
}

export async function getProcs(params) {
  return request.get(toQs(procs, params));
}

export async function getAllProcs(params) {
  return request.get(toQs(procsAll, params));
}

export async function cancelProc(id) {
  return request.delete(toUrl(procCancel, { id }));
}

export async function getNotify(params) {
  return request.get(toQs(notify, params));
}

export async function readNotify(id) {
  return request.post(toUrl(updateNotify, { id }));
}

export async function readNotifyBatch(ids) {
  return request.post(toUrl(updateNotifyBatch, { ids }));
}

export async function closeFlowRq(payload) {
  const { prcId, remark } = payload;
  return request.delete(toQs(toUrl(closeFlow, { prcId }), { closeReason: remark }));
}
