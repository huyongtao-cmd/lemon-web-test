import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { system } = api.production;

// 系统选择项
export async function systemSelectionCreate(param) {
  return request.post(system.systemSelectionCreateUri, { body: param });
}
export async function systemSelectionModify(param) {
  return request.put(system.systemSelectionModifyUri, { body: param });
}
export async function systemSelectionDetail(param) {
  return request.get(toUrl(system.systemSelectionDetailUri, param));
}
export async function systemSelectionListPaging(param) {
  return request.get(toQs(system.systemSelectionListPagingUri, param));
}
export async function systemSelectionLogicalDelete(param) {
  return request.patch(toQs(system.systemSelectionLogicalDeleteUri, param));
}
export async function systemSelectionListByKey(param) {
  return request.get(toUrl(system.systemSelectionListByKeyUri, param));
}
export async function systemSelectionContainBase(param) {
  return request.get(toQs(system.systemSelectionContainBaseUri, param));
}
export async function systemSelectionClearCache(param) {
  return request.get(toQs(system.systemSelectionClearCacheUri, param));
}
// 系统选择项-级联
export async function systemSelectionCascader(param) {
  return request.get(toQs(system.systemSelectionCascaderUri, param));
}

// 自定义选择项
export async function customSelectionCreate(param) {
  return request.post(system.customSelectionCreateUri, { body: param });
}
export async function customSelectionModify(param) {
  return request.put(system.customSelectionModifyUri, { body: param });
}
export async function customSelectionDetail(param) {
  return request.get(toUrl(system.customSelectionDetailUri, param));
}
export async function customSelectionListPaging(param) {
  return request.get(toQs(system.customSelectionListPagingUri, param));
}
export async function customSelectionLogicalDelete(param) {
  return request.patch(toQs(system.customSelectionLogicalDeleteUri, param));
}
export async function customSelectionListByKey(param) {
  return request.get(toUrl(system.customSelectionListByKeyUri, param));
}
export async function customSelectionContainBase(param) {
  return request.get(toQs(system.customSelectionContainBaseUri, param));
}
export async function customSelectionClearCache(param) {
  return request.get(toQs(system.customSelectionClearCacheUri, param));
}
// 自定义选择项-级联
export async function customSelectionCascader(param) {
  return request.get(toQs(system.customSelectionCascaderUri, param));
}

// 系统国际化
export async function systemLocalePortal(param) {
  return request.get(toQs(system.systemLocalePortalUri, param));
}
export async function systemLocaleCreate(param) {
  return request.post(system.systemLocaleCreateUri, { body: param });
}
export async function systemLocaleModify(param) {
  return request.put(system.systemLocaleModifyUri, { body: param });
}
export async function systemLocaleDetail(param) {
  return request.get(toUrl(system.systemLocaleDetailUri, param));
}
export async function systemLocaleListPaging(param) {
  return request.get(toQs(system.systemLocaleListPagingUri, param));
}
export async function systemLocaleLogicalDelete(param) {
  return request.patch(toQs(system.systemLocaleLogicalDeleteUri, param));
}
export async function systemLocaleLogicalUpload(param) {
  return request.post(system.systemLocaleLogicalUploadUri, { body: param });
}
export async function systemLocaleClearCache(param) {
  return request.get(toUrl(system.systemLocaleClearCacheUri, param));
}

// 系统提醒
export async function systemRemindCreate(param) {
  return request.post(system.systemRemindCreateUri, { body: param });
}
export async function systemRemindOverallModify(param) {
  return request.put(system.systemRemindOverallModifyUri, { body: param });
}
export async function systemRemindPartialModify(param) {
  return request.put(system.systemRemindPartialModifyUri, { body: param });
}
export async function systemRemindDetail(param) {
  return request.get(toUrl(system.systemRemindDetailUri, param));
}
export async function systemRemindListPaging(param) {
  return request.get(toQs(system.systemRemindListPagingUri, param));
}
export async function systemRemindLogicalDelete(param) {
  return request.patch(toQs(system.systemRemindLogicalDeleteUri, param));
}
export async function systemRemindClearCache(param) {
  return request.get(toUrl(system.systemRemindClearCacheUri, param));
}
export async function systemRemindPortal(param) {
  return request.get(toUrl(system.systemRemindPortalUri, param));
}
