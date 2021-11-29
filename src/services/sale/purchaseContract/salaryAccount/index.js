/* eslint-disable no-redeclare */
import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  accountsList,
  updateAccount,
  saveAccount,
  deleteAccount,
  accountInfo,
  generateByCost,
} = api.sale.purchaseContract;

// 获取薪资福利支付账户信息
export async function getAccountsList(params) {
  return request.get(toQs(accountsList, params));
}

// 更新薪资福利支付账户信息
export async function updateAccountFn(data) {
  return request.put(updateAccount, {
    body: data,
  });
}

// 保存薪资福利支付账户信息
export async function saveAccountFn(data) {
  return request.post(saveAccount, {
    body: data,
  });
}

// 删除薪资福利支付账户信息
export async function deleteAccountFn({ ids }) {
  return request.patch(toUrl(deleteAccount, { ids }));
}

// 获取薪资福利支付账户信息
export async function getaccountInfoById({ id }) {
  return request.get(toUrl(accountInfo, { id }));
}

// 通过薪资成本生成付款申请单
export async function generateByCostById({ id }) {
  return request.get(toUrl(generateByCost, { id }));
}
