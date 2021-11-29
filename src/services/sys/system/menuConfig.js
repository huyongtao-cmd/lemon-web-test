import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { menuConfig } = api.sys;
const {
  menuConfigList,
  menuConfigCreate,
  menuConfigEdit,
  menuConfigInfo,
  menuConfigDelete,
} = menuConfig;

// 获取配置列表
export async function getMenuConfigList(params) {
  return request.get(toQs(menuConfigList, params));
}
// 新增菜单
export async function menuCreate(payload) {
  return request.post(menuConfigCreate, {
    body: payload,
  });
}
// 编辑菜单
export async function menuEdit(payload) {
  return request.put(menuConfigEdit, {
    body: payload,
  });
}
// 获取单个菜单信息
export async function getMenuInfo(id) {
  return request.get(menuConfigInfo.replace('{id}', id));
}
// 删除菜单
export async function deleteMenu(id) {
  return request.delete(menuConfigDelete.replace('{id}', id));
}
