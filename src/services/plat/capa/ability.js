import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  abilities,
  ability,
  abilitySave,
  capaAbilities,
  capaAbilitiesAdd,
  capaAbilitiesDel,
} = api.user.ability;

export async function queryAbilitys(params) {
  return request.get(toQs(abilities, params));
}

export async function findAbilityById({ id }) {
  return request.get(toUrl(ability, { id }));
}

export async function saveAbility(params) {
  return request.put(abilitySave, {
    body: params,
  });
}

export async function queryCapaAbilities(params) {
  return request.get(toQs(capaAbilities, params));
}

export async function addCapaAbilities(params) {
  return request.post(capaAbilitiesAdd, {
    body: params,
  });
}

export async function delCapaAbilities({ ids }) {
  return request.patch(toUrl(capaAbilitiesDel, { ids: ids.join(',') }));
}
