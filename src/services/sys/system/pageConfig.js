import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  businessPageCreateUri,
  businessPageModifyUri,
  businessPageDetailUri,
  businessPageListPagingUri,
  businessPageLogicalDeleteUri,
  selectBusinessTableConditionalUri,
  businessTableFieldsUri,
  businessPageBlockSaveOrUpdateUri,
  businessPageBlockDetailUri,
  businessPageButtonListUri,
  businessPageButtonSaveOrUpdateUri,
  businessPageTabSaveOrUpdateUri,
  businessPageDetailByNoUri,
  businessPageDetailByNosUri,
  businessPagePermissionSaveOrUpdateUri,
  businessPagePermissionDeleteUri,
  businessPageFieldTypePermissionUri,
  businessPageTabChooseUri,
  businessPageSceneUri,
  businessPageSceneDeleteUri,
  businessSceneDetailUri,
} = api.sys.system;

// 页面配置
export async function businessPageCreate(param) {
  return request.post(businessPageCreateUri, { body: param });
}
export async function businessPageModify(param) {
  return request.put(businessPageModifyUri, { body: param });
}
export async function businessPageDetail(param) {
  return request.get(toUrl(businessPageDetailUri, param));
}
export async function businessPageListPaging(param) {
  return request.get(toQs(businessPageListPagingUri, param));
}
export async function businessPageLogicalDelete(param) {
  return request.patch(toQs(businessPageLogicalDeleteUri, param));
}
export async function selectBusinessTableConditional(param) {
  return request.get(toQs(selectBusinessTableConditionalUri, param));
}
export async function businessTableFields(param) {
  return request.get(toUrl(businessTableFieldsUri, param));
}
export async function businessPageBlockSaveOrUpdate(param) {
  return request.put(businessPageBlockSaveOrUpdateUri, { body: param });
}
export async function businessPageBlockDetail(param) {
  return request.get(toUrl(businessPageBlockDetailUri, param));
}
export async function businessPageButtonList(param) {
  return request.get(toUrl(businessPageButtonListUri, param));
}
export async function businessPageButtonSaveOrUpdate(param) {
  return request.put(businessPageButtonSaveOrUpdateUri, { body: param });
}
export async function businessPageTabSaveOrUpdate(param) {
  return request.put(businessPageTabSaveOrUpdateUri, { body: param });
}
export async function businessPageDetailByNo(param) {
  return request.get(toUrl(businessPageDetailByNoUri, param));
}
export async function businessPageDetailByNos(param) {
  return request.get(toUrl(businessPageDetailByNosUri, param));
}

// 权限保存
export async function businessPagePermissionSaveOrUpdate(param) {
  return request.put(businessPagePermissionSaveOrUpdateUri, { body: param });
}
// 权限删除
export async function businessPagePermissionDelete(param) {
  return request.delete(toQs(businessPagePermissionDeleteUri, param));
}
// udc权限下拉
export async function businessPageFieldTypePermission(param) {
  return request.get(toQs(businessPageFieldTypePermissionUri, param));
}
// 新建可配置化业务页面标签页UDC选择-可选/不可选 POST
export async function businessPageTabChoose(param) {
  return request.post(businessPageTabChooseUri, { body: param });
}
// 场景管理查询
export async function getPageScene(param) {
  return request.get(toQs(businessPageSceneUri, param));
}
// 场景管理新增
export async function addPageScene(param) {
  return request.post(businessPageSceneUri, { body: param });
}
// 场景管理删除
export async function deletePageScene(param) {
  return request.patch(toUrl(businessPageSceneDeleteUri, { ids: param }));
}
// 场景详情
export async function businessSceneDetail(param) {
  return request.get(toUrl(businessSceneDetailUri, param));
}
