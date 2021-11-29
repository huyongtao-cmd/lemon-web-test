import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  systemFunctionCreateUri,
  systemFunctionModifyUri,
  systemFunctionDetailUri,
  systemFunctionListPagingUri,
  systemFunctionLogicalDeleteUri,

  businessCheckCreateUri,
  businessCheckModifyUri,
  businessCheckDetailUri,
  businessCheckListPagingUri,
  businessCheckLogicalDeleteUri,
  businessCheckSwitchChangeUri,
} = api.sys.system;

// 功能配置
export async function systemFunctionCreate(param) {
  return request.post(systemFunctionCreateUri, { body: param });
}
export async function systemFunctionModify(param) {
  return request.put(systemFunctionModifyUri, { body: param });
}
export async function systemFunctionDetail(param) {
  return request.get(toUrl(systemFunctionDetailUri, param));
}
export async function systemFunctionListPaging(param) {
  return request.get(toQs(systemFunctionListPagingUri, param));
}
export async function systemFunctionLogicalDelete(param) {
  return request.patch(toQs(systemFunctionLogicalDeleteUri, param));
}

// 业务检查
export async function businessCheckCreate(param) {
  return request.post(businessCheckCreateUri, { body: param });
}
export async function businessCheckModify(param) {
  return request.put(businessCheckModifyUri, { body: param });
}
export async function businessCheckDetail(param) {
  return request.get(toUrl(businessCheckDetailUri, param));
}
export async function businessCheckListPaging(param) {
  return request.get(toQs(businessCheckListPagingUri, param));
}
export async function businessCheckLogicalDelete(param) {
  return request.patch(toQs(businessCheckLogicalDeleteUri, param));
}
export async function businessCheckSwitchChange(param) {
  return request.get(toQs(businessCheckSwitchChangeUri, param));
}
