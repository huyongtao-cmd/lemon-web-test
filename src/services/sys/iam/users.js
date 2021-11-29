import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { iam } = api.sys;
const { users } = iam;

export async function findUsers(params) {
  return request.get(toQs(users.users, params));
}

export async function findUsersRes(params) {
  return request.get(toQs(users.usersRes, params));
}

export async function findUserById(id) {
  return request.get(`${users.users}/${id}`);
}

export async function create(params) {
  return request.post(users.users, {
    body: params,
  });
}

export async function update(id, params) {
  return request.put(`${users.users}/${id}`, {
    body: params,
  });
}

export async function disable(id) {
  return request.patch(`${users.users}/${id}/x`);
}

export async function enable(id) {
  return request.patch(`${users.users}/${id}/v`);
}

export async function getUserRaabs(id) {
  return request.get(toUrl(users.raabs, { id }));
}

export async function updateUserRaabs(id, params) {
  return request.put(toUrl(users.raabs, { id }), {
    body: params,
  });
}

export async function getUserRoles(id) {
  return request.get(toUrl(users.roles, { id }));
}

export async function updateUserRoles(id, params) {
  return request.put(toUrl(users.roles, { id }), {
    body: params,
  });
}

export async function getUserFlowRoles(id) {
  return request.get(toUrl(users.userFlowRoles, { id }));
}

export async function getFlowRoles() {
  return request.get(users.flowRoles);
}

export async function updateUserFlowRoles(params) {
  return request.put(users.flowRoles, {
    body: params,
  });
}

// 重制密码
export async function pwdReset(id) {
  return request.post(toQs(users.resetPwd, { id }));
}
