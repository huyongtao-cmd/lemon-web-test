import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  capaSets,
  capaSet,
  capaSetSave,
  capaSetLevels,
  setCapas,
  capaSetLevelSel,
  capaSetLevelDetSel,
  setCapasAdd,
  setCapasDel,
  setCapaStat,
} = api.user.ability;

export async function querySets(params) {
  return request.get(toQs(capaSets, params));
}

export async function findSetById({ id }) {
  return request.get(toUrl(capaSet, { id }));
}

export async function saveSet(params) {
  return request.put(capaSetSave, {
    body: params,
  });
}

export async function querySetLevelsById({ id }) {
  return request.get(toUrl(capaSetLevels, { id }));
}

export async function querySetAbilityByLevelId({ id }) {
  return request.get(toUrl(setCapas, { id }));
}

export async function queryCapaSetLevelSel() {
  return request.get(capaSetLevelSel);
}

export async function queryCapaSetLevelDetSel({ id }) {
  return request.get(toUrl(capaSetLevelDetSel, { id }));
}

// 批量操作

export async function addCapaSetCapas(payload) {
  return request.post(setCapasAdd, { body: payload });
}

export async function changeCapaSetCapa(payload) {
  return request.patch(setCapaStat, { body: payload });
}

export async function deleteCapaSetCapas({ ids }) {
  const modifiedUrl = setCapasDel.replace(':ids', ids.join(','));
  return request.patch(modifiedUrl);
  // return request.patch(toUrl(setCapasDel, { ids: ids.join(',') }));
}
