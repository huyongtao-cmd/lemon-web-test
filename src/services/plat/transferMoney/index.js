import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  getTransferCompany,
  getTransferAccountById,
  getCollectionAccountById,
  getApplicantBuByResId,
  transferMoneyList,
  transferMoneyDetail,
  transferMoneyDelete,
  transferMoneyEdit,
} = api.plat;
// 获取划款公司
export async function getTransferCompanyUri() {
  return request.get(getTransferCompany);
}

// 根据地址簿号查划款公司银行账号多列下拉
export async function getTransferAccountByIdUri(id) {
  return request.get(toUrl(getTransferAccountById, id));
}

// 根据地址簿号查划款公司银行账号多列下拉
export async function getCollectionAccountByIdUri(id) {
  return request.get(toUrl(getCollectionAccountById, id));
}

// 根据选择的申请人获取申请人BU
export async function getApplicantBuByResIdUri(resId) {
  return request.get(toUrl(getApplicantBuByResId, resId));
}

// 资金划款列表
export async function transferMoneyListRq(params) {
  return request.get(toQs(transferMoneyList, params));
}

// 资金划款新增、修改
export async function transferMoneyEditRq(params) {
  return request.post(transferMoneyEdit, {
    body: params,
  });
}

// 资金划款详情
export async function transferMoneyDetailRq(id) {
  return request.get(toUrl(transferMoneyDetail, id));
}

// 资金划款删除
export async function transferMoneyDeleteRq(payload) {
  return request.patch(toQs(transferMoneyDelete, payload));
}
