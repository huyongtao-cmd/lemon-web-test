import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  systemSettingCreate,
  systemSettingModify,
  systemSettingDetail,
  systemSettingListPaging,
  systemSettingLogicalDelete,
  systemSettingClearCacheUri,
  systemSettingDetailByKeyUri,
} = api.production.system;

// 系统设置

// 新增系统设置
export async function systemSettingCreateRq(param) {
  return request.post(systemSettingCreate, { body: param });
}

// 修改系统设置
export async function systemSettingModifyRq(param) {
  return request.put(systemSettingModify, { body: param });
}

// 查看系统设置详情
export async function systemSettingDetailRq(param) {
  return request.get(toUrl(systemSettingDetail, param));
}

// 查询所有系统设置
export async function systemSettingListPagingRq(param) {
  return request.get(toQs(systemSettingListPaging, param));
}

// 删除系统设置
export async function systemSettingLogicalDeleteRq(param) {
  return request.patch(toQs(systemSettingLogicalDelete, param));
}
// 清除系统设置缓存
export async function systemSettingClearCache() {
  return request.get(systemSettingClearCacheUri);
}
// 通过key获取系统设置项
export async function systemSettingDetailByKey(param) {
  return request.get(toUrl(systemSettingDetailByKeyUri, param));
}
