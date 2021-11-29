import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { elSound } = api.sys;
const { getElSoundList, addElSound, getElSoundDetails, elSoundDelete, findtop } = elSound;

export async function getElSoundListRq(params) {
  return request.get(toQs(getElSoundList, params));
}

export async function addElSoundRq(payload) {
  return request.post(addElSound, {
    body: payload,
  });
}

export async function getElSoundDetailsRq(payload) {
  return request.get(toUrl(getElSoundDetails, { id: payload }));
}

export async function elSoundDeleteRq(payload) {
  return request.patch(toUrl(elSoundDelete, { ids: payload.join(',') }));
}
export async function findtopRq(params) {
  return request.patch(toUrl(findtop, { id: params }));
}
