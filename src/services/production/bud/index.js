import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { bud } = api.production;

// 预算
export async function budgetCreate(param) {
  return request.post(bud.budgetCreateUri, { body: param });
}
export async function budgetOverallModify(param) {
  return request.put(bud.budgetOverallModifyUri, { body: param });
}
export async function budgetPartialModify(param) {
  return request.put(bud.budgetPartialModifyUri, { body: param });
}
export async function budgetDetail(param) {
  return request.get(toQs(toUrl(bud.budgetDetailUri, param), param));
}
export async function budgetListPaging(param) {
  return request.get(toQs(bud.budgetListPagingUri, param));
}
export async function budgetLogicalDelete(param) {
  return request.patch(toQs(bud.budgetLogicalDeleteUri, param));
}
export async function budgetOccupyInfo(param) {
  return request.get(toQs(bud.budgetOccupyInfoUri, param));
}

// 预算拨款
export async function budgetAppropriationCreate(param) {
  return request.post(bud.budgetAppropriationCreateUri, { body: param });
}
export async function budgetAppropriationOverallModify(param) {
  return request.put(bud.budgetAppropriationOverallModifyUri, { body: param });
}
export async function budgetAppropriationPartialModify(param) {
  return request.put(bud.budgetAppropriationPartialModifyUri, { body: param });
}
export async function budgetAppropriationDetail(param) {
  return request.get(toUrl(bud.budgetAppropriationDetailUri, param));
}
export async function budgetAppropriationListPaging(param) {
  return request.get(toQs(bud.budgetAppropriationListPagingUri, param));
}
export async function budgetAppropriationLogicalDelete(param) {
  return request.patch(toQs(bud.budgetAppropriationLogicalDeleteUri, param));
}
// 预算变更
export async function budgetAdjustSave(param) {
  return request.put(bud.budgetAdjustSaveUri, { body: param });
}
export async function budgetAdjustDetail(param) {
  return request.get(toUrl(bud.budgetAdjustDetailUri, param));
}
export async function budgetAdjustListPaging(param) {
  return request.get(toQs(bud.budgetAdjustListPagingUri, param));
}
