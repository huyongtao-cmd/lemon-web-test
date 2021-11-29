import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { levels, level, levelSave } = api.user.ability;

export async function querylevels(params) {
  return request.get(toQs(levels, params));
}

export async function findLevelById({ id }) {
  return request.get(toUrl(level, { id }));
}

export async function saveLevel(params) {
  return request.put(levelSave, {
    body: params,
  });
}
