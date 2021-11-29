import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  prePayPersonal,
  prePayAction,
  prePayDetail,
  particularSelect,
  prePayDelete,
} = api.user.center;

// 预付款申请查询
export async function qeuryPrePayList(params) {
  return request.get(toQs(prePayPersonal, params));
}

// 新增
export async function createPrePay(params) {
  return request.post(prePayAction, { body: params });
}

// 编辑
export async function updatePrePay(params) {
  return request.put(prePayAction, { body: params });
}

// 详情
export async function getPrePayDetail(id) {
  return request.get(toUrl(prePayDetail, { id }));
}

// 特殊费用申请下拉
export async function queryParticularSelect() {
  return request.get(particularSelect);
}

// 批量删除
export async function deletePrePay(ids) {
  return request.patch(toUrl(prePayDelete, { ids }));
}
