import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  tenantProcInsert,
  tenantProcOverall,
  tenantProcPartial,
  tenantProcLogicDel,
  tenantProcListPaging,
  tenantProcDetail,
  getCurTenProcUri,
} = api.sys.system;

// 单表场景
export async function insert(param) {
  return request.post(tenantProcInsert, { body: param });
}
export async function overall(param) {
  return request.put(tenantProcOverall, { body: param });
}
export async function partial(param) {
  return request.put(tenantProcPartial, { body: param });
}
export async function logicDel(param) {
  return request.patch(toUrl(tenantProcLogicDel, param));
}
export async function listPaging(param) {
  return request.get(toQs(tenantProcListPaging, param));
}
export async function detail(param) {
  return request.get(toUrl(tenantProcDetail, param));
}
export async function getCurTenProc() {
  return request.get(getCurTenProcUri);
}
