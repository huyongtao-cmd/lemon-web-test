import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { flowRoles, flowRole, flowRoleModified, flowRoleDelete } = api.sys.flow;

export async function getRoles(params) {
  return request.get(toQs(flowRoles, params));
}

export async function getRole(id) {
  return request.get(toUrl(flowRole, { id }));
}

export async function modifiedRole(params) {
  return request.put(flowRoleModified, {
    body: params,
  });
}

export async function deleteRole(ids) {
  return request.patch(flowRoleDelete, {
    body: ids,
  });
}
