import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { homeConfig } = api.sys;
const {
  homeConfigList,
  setHomePage,
  homeConfigNavList,
  menuList,
  createMenu,
  editMenu,
  deleteMenu,
  menuInfo,
  homePageConfigInfo,
  insertLogo,
  logoInfo,
  updateLogo,
  extensionList,
  insertExtension,
  getExtensionInfo,
  updateExtension,
  logoAndExtensionInfo,
  deleteExtensionMenu,
} = homeConfig;

// 获取工作台配置列表
export async function getHomeConfigList(params) {
  return request.get(toQs(homeConfigList, params));
}

// 获取单个菜单信息
export async function setDefaultHomePage(id) {
  return request.get(setHomePage.replace('{id}', id));
}

// 获取菜工作台列表 用于下拉
export async function getHomeConfigListNav() {
  return request.get(homeConfigNavList);
}

// 获取快捷菜单列表
export async function getMenuList(params) {
  return request.get(toQs(menuList, params));
}

// 新增菜单
export async function menuCreate(payload) {
  return request.post(createMenu, {
    body: payload,
  });
}

// 编辑菜单
export async function menuEdit(payload) {
  return request.put(editMenu, {
    body: payload,
  });
}

// 获取单个菜单信息
export async function getMenuInfo(id) {
  return request.get(menuInfo.replace('{id}', id));
}

// 删除菜单
export async function deleteMenuFn(id) {
  return request.delete(deleteMenu.replace('{id}', id));
}

// 获取工作台配置
export async function getHomePageConfigInfo() {
  return request.get(homePageConfigInfo);
}

// 新增Logo
export async function logoCreate(payload) {
  return request.post(insertLogo, {
    body: payload,
  });
}

// 获取Logo信息
export async function getLogoInfo(payload) {
  return request.get(logoInfo);
}

// 更新Logo
export async function logoUpdate(payload) {
  return request.put(updateLogo, {
    body: payload,
  });
}

// 获取辅助菜单列表
export async function getExtensionList(params) {
  return request.get(toQs(extensionList, params));
}

// 新增辅助菜单
export async function insertExtensionFn(payload) {
  return request.post(insertExtension, {
    body: payload,
  });
}

// 获取辅助菜单信息
export async function getExtensionInfoFn(id) {
  return request.get(getExtensionInfo.replace('{id}', id));
}

// 更新辅助菜单信息
export async function updateExtensionFn(payload) {
  return request.put(updateExtension, {
    body: payload,
  });
}

// 删除辅助菜单
export async function deleteExtensionMenuFn(id) {
  return request.delete(deleteExtensionMenu.replace('{id}', id));
}

// 获取辅助菜单列表
export async function logoAndExtensionInfoFn() {
  return request.get(toQs(logoAndExtensionInfo));
}
