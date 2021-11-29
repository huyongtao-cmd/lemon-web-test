import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  buResSelect,
  buResPlusSelect,
  buResRoleSelect,
  buPUserSelect,
  buResInfo,
  buResQuery,
  buResInfoSave,
  buResRoleInfo,
  buSaveResRole,
  resActive,
} = api.org;

export async function queryBuResInfo(buId) {
  return request(toUrl(buResInfo, buId), {
    method: 'GET',
  });
}

// bu详情-带参数查询资源信息
export async function queryBuResList(params) {
  return request.get(toQs(buResQuery, params));
}

export async function queryBuResRoleInfo(buresId) {
  return request(toUrl(buResRoleInfo, buresId), {
    method: 'GET',
  });
}

export async function findBuResSelect({ buId }) {
  return request(toUrl(buResSelect, { buId }), {
    method: 'GET',
  });
}

export async function findBuResPlusSelect({ buId }) {
  return request(toUrl(buResPlusSelect, { buId }), {
    method: 'GET',
  });
}

// export async function findBuResRoleSelect({ buresId }) {
//   return request(toUrl(buResRoleSelect, { buresId }), {
//     method: 'GET',
//   });
// }
export async function findBuResRoleSelect() {
  return request(buResRoleSelect, {
    method: 'GET',
  });
}

export async function findBuPUserSelect() {
  return request(buPUserSelect, {
    method: 'GET',
  });
}

export async function createBuResInfo(id, params) {
  return request(toUrl(buResInfo, { buId: id }), {
    method: 'POST',
    body: params,
  });
}

export async function editBuResInfo(params) {
  return request.put(buResInfoSave, {
    body: params,
  });
}

export async function saveResRole(buId, buResId, params) {
  return request(toUrl(buSaveResRole, { buId, buResId }), {
    method: 'PUT',
    body: {
      entity: params.roleTableData,
      delList: params.delroleTableData,
    },
  });
}

export async function activeRes(params) {
  return request.put(resActive, {
    body: params,
  });
}
