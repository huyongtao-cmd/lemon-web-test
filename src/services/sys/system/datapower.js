import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  datapower,
  list,
  clean,
  updateStatus,
  updateStrategy,
  delDatapower,
  delRoleDatapower,
  addRoleDatapower,
  selectRoles,
  selectRolesByBaseBuId,
} = api.sys.datapower;

export async function findDatapowers(params) {
  return request.get(toQs(datapower, params));
}

export async function findDataList() {
  return request.get(list);
}

export async function save(params) {
  return request.put(datapower, {
    body: params,
  });
}

// 清除权限缓存
export async function cleanDatapower() {
  return request.get(clean);
}

export async function updateDatapowerStatus(params) {
  return request.post(updateStatus, {
    body: params,
  });
}

export async function updateRoleDataStrategy(params) {
  return request.post(toUrl(updateStrategy, params), {
    body: params,
  });
}

export async function deleteDatapower(ids) {
  return request.delete(toUrl(delDatapower, { ids: ids.join(',') }));
}

// 删除某个角色的数据权限
export async function deleteRoleDatapower(roleCode) {
  return request.delete(toUrl(delRoleDatapower, { roleCode }));
}

// 新增某个角色数据权限
export async function createRoleDatapower(params) {
  return request.put(
    toUrl(addRoleDatapower, { roleCode: params.roleCode, strategy: params.strategy }),
    {
      body: {
        initPower: params.initPower,
      },
    }
  ); // roleCode,strategy
}

// 所有角色的单列下拉
export async function selectAllRoles() {
  return request.get(selectRoles);
}

// 删除某个角色的数据权限
export async function selectFilterRole(baseBuId) {
  return request.get(toUrl(selectRolesByBaseBuId, { baseBuId }));
}
