import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  customSettingCreate,
  customSettingModify,
  customSettingDetail,
  customSettingListPaging,
  customSettingLogicalDelete,
  customSettingClearCacheUri,
  customSettingDetailByKeyUri,
} = api.production.system;

// 用户自定义设置

// 新增用户自定义设置
export async function customSettingCreateRq(param) {
  return request.post(customSettingCreate, { body: param });
}

// 修改用户自定义设置
export async function customSettingModifyRq(param) {
  return request.put(customSettingModify, { body: param });
}

// 查看用户自定义设置详情
export async function customSettingDetailRq(param) {
  return request.get(toUrl(customSettingDetail, param));
}

// 查询用户自定义设置
export async function customSettingListPagingRq(param) {
  return request.get(toQs(customSettingListPaging, param));
}

// 逻辑删除用户自定义设置
export async function customSettingLogicalDeleteRq(param) {
  return request.patch(toQs(customSettingLogicalDelete, param));
}
// 清除系统设置缓存
export async function customSettingClearCache() {
  return request.get(customSettingClearCacheUri);
}
// 通过key获取系统设置项
export async function customSettingDetailByKey(param) {
  return request.get(toUrl(customSettingDetailByKeyUri, param));
}
