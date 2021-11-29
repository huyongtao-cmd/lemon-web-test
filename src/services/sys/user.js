import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toUrl } from '@/utils/stringUtils';

const { validUserSelect } = api.user;
const { usersSelect, usersSelectAll } = api.sys;

// tag: user相关service转移到 services/sys/iam/users 目录下； iam 为架构管理下的相关操作

// TODO: 资源列表可设置10-30分钟缓存（一个公司不会一天到晚加减人的。。。应该）以提升系统性能。
export async function selectUsers(params) {
  return request.get(toUrl(usersSelect, { params }));
}

// 拉去所有资源信息，包括未入职。离职等
export async function selectUsersAll(params) {
  return request.get(toUrl(usersSelectAll, { params }));
}

// 有效资源用户多列下拉
export async function selectValidatedUser(params) {
  return request.get(toUrl(validUserSelect, { params }));
}
