import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { relateUsersListUri, usersListUri, menuListUri, dataListUri, flowListUri } = api.sys.system;

// 对应角色及用户   功能维度右侧对应的列表查询
export async function relateUsersListUriRq(params) {
  return request.get(toQs(relateUsersListUri, params));
}

// 用户维度对应的左侧用户列表
export async function usersListUriRq(params) {
  return request.get(toQs(usersListUri, params));
}

// 用户维度对应的右侧第一个页签菜单权限
export async function menuListUriRq(params) {
  return request.get(toQs(menuListUri, params));
}

// 用户维度对应的右侧第二个页签数据权限
export async function dataListUriRq(params) {
  return request.get(toQs(dataListUri, params));
}

// 用户维度对应的右侧第三个页签流程权限
export async function flowListUriRq(params) {
  return request.get(toQs(flowListUri, params));
}
