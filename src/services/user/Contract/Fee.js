import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { otherFee, relatedSub, otherFeeDetil, contractSales } = api.user.contract;

// 获取相关费用详情
export async function contractSalesRq(params) {
  return request.get(toUrl(contractSales, params));
}

// 获取相关费用UDC
export async function otherFeeRq(params) {
  return request.get(toUrl(otherFee, params));
}

// 支付明细新增/修改
export async function otherFeeDeRq(params, payload) {
  return request.post(toUrl(otherFee, payload), {
    body: params,
  });
}

// 新增和修改接口
export async function relatedSubRq(params, payload) {
  return request.post(toUrl(relatedSub, payload), {
    body: params,
  });
}

// 支付明细
export async function otherFeeDetilRq(id) {
  return request.get(toUrl(otherFeeDetil, { id }));
}
