import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  feeApplys,
  feeApply,
  feeApplySave,
  feeApplyDel,
  custSelectBy,
  buSelectBy,
  getAccTreeByBuo,
  specTaskStart,
} = api.user.feeapply;
const { doTask } = api.bpm;

// 查询费用申请列表
export async function findFeeApplysList(params) {
  return request.get(toQs(feeApplys, params));
}

// 查询单条特殊费用申请
export async function findFeeApplyById({ id }) {
  return request.get(toUrl(feeApply, { id }));
}

// 保存特殊费用申请
export async function saveFeeApply(params) {
  return request.post(feeApplySave, {
    body: params,
  });
}

export async function deleteFeeApplys(ids) {
  return request.patch(toUrl(feeApplyDel, { ids: ids.join(',') }));
}

// 根据项目id获取合同表中的客户信息
export async function selectCustBy(params) {
  return request.get(toQs(custSelectBy, params));
}

// 根据项目id获取费用承担bu
export async function selectBuBy(params) {
  return request.get(toQs(buSelectBy, params));
}

// 根据费用承担bu.id获取费用科目树
export async function findAccTreeByBuId(buId) {
  return request.get(toUrl(getAccTreeByBuo, buId));
}

// 提交特殊费用申请流程
export async function startFeeApply(id) {
  return request.post(toUrl(specTaskStart, { id }));
}
