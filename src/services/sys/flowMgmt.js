import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { procs, unload, unloadForce, tasks, cc, to } = api.bpm;

export async function queryProcs(params) {
  return request.get(toQs(procs, params));
}

export async function unloadFlow(id) {
  return request.delete(toUrl(unload, { id }));
}

export async function unloadFlowForce(id) {
  return request.delete(toUrl(unloadForce, { id }));
}

export async function getTask(id) {
  return request.get(toUrl(tasks, { id }));
}

export async function getPointCC(id, taskKey) {
  return request.get(toUrl(cc, { id, taskKey }));
}

export async function pointCC(id, taskKey, params) {
  return request.put(toUrl(cc, { id, taskKey }), {
    body: params,
  });
}

export async function getPointTo(id, taskKey) {
  return request.get(toUrl(to, { id, taskKey }));
}

export async function pointTo(id, taskKey, params) {
  return request.put(toUrl(to, { id, taskKey }), {
    body: params,
  });
}
