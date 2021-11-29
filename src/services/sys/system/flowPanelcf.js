import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const { getFlowData, listFlowPanel, save, findById, deleteByIds, partial } = api.user.flow;

export async function getFlowDataFn() {
  return request.get(getFlowData);
}

export async function list(param) {
  return request.get(toQs(listFlowPanel, param));
}

export async function saveFn(param) {
  return request.post(save, {
    body: param,
  });
}

export async function findByIdFn(param) {
  return request.get(toUrl(findById, param));
}

export async function deleteFn(param) {
  return request.patch(toUrl(deleteByIds, param));
}

export async function partialFn(param) {
  return request.put(partial, {
    body: param,
  });
}
