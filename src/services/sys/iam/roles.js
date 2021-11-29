import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { iam } = api.sys;
const { roles: iamRole } = iam;
const { roles, navs, raabs } = iamRole;

export async function findRoles(params) {
  return request.get(toQs(roles, params));
}

export async function findRoleById(id) {
  return request.get(`${roles}/${id}`);
}

export async function create(params) {
  return request.post(roles, {
    body: params,
  });
}

export async function update(id, params) {
  return request.put(`${roles}/${id}`, {
    body: params,
  });
}

export async function remove(id) {
  return request.delete(`${roles}/${id}`);
}

export async function disable(id) {
  return request.patch(`${roles}/${id}/x`);
}

export async function enable(id) {
  return request.patch(`${roles}/${id}/v`);
}

export async function findNavsById(id) {
  return request.get(toUrl(navs, { id }));
}

export async function updateRoleNavs(id, params) {
  return request.put(toUrl(navs, { id }), {
    body: params,
  });
}

export async function findRaabsById(id) {
  return request.get(toUrl(raabs, { id }));
}

export async function updateRoleRaabs(id, params) {
  return request.put(toUrl(raabs, { id }), {
    body: params,
  });
}
