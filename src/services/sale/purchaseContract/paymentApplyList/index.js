/* eslint-disable no-redeclare */
import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  prePaymentApplySave,
  prePaymentApplyUpdate,
  paymentApplyList,
  paymentApplyFlowSubmit,
  removePaymentApply,
  paymentApplyDetail,
  paymentApplyAccounts,
  paymentApplyAccountsNo,
  paymentApplyInvoices, // 获取发票号
  paymentApplyInvoicesDetail, // 获取发票详情
  paymentApplyOpportunity, // 商机
  paymentApplyTempds, // 科目模版
  paymentSlipSave, // 付款单记录保存
  paymentSlipUpdate, // 付款单记录更新
  paymentSlipFlowSubmit, // 付款单记录提交发起工作流
  paymentSlipDelete, // 付款单记录删除
  paymentSlipView, // 付款记录列表
  paymentApplyByDocNoScene, // 根据前置单据和场景获取单据号
  purchaseByDoc, // 预付款：根据前置单据和场景获取采购合同信息
  paymentSlipDetailById, // 付款记录详情
  paymentApplyWriteoffSelect, // 预付款核销单据号下拉框
  paymentWriteoffNoAndType, // 预付款核销单据号获取详情
  paymentSlipListById, // 根据付款申请单ID获取付款单记录列表
  paymentAppFirstFlowSubmit, // 退回第一个节点的提交
  paymentSlipFlowReSubmit, // 退回后的提交
  paymentApplyCalc, // 根据前置单据号获取费率
  paymentSlipFlowBatchSubmit, // 付款记录批量提交
  paymentSlipBatchOperation,
  // 付款记录的审批和状态流转
  paymentSlipList, //  列表查询
  batchOperationOperate, // 批量操作付款单记录
  channelCostList, // 渠道费用列表
  paymentApplyIdByDoc, // 根据付款申请单编号获取ID
  purchaseAgreementIdByDoc, // 根据采购协议编号查询协议ID
  purchaseContractIdByDoc, // 根据采购合同编号查询采购合同ID
} = api.sale.purchaseContract;

// 渠道费用列表
export async function channelCostListRq(params) {
  return request.get(toQs(channelCostList, params));
}

// 根据id获取付款申请单详情
export async function getPaymentApplyById(id) {
  return request.get(toUrl(paymentApplyDetail, { id }));
}
// 根据筛选条件获取付款申请单列表
export async function getPaymentApplyList(params) {
  return request.get(toQs(paymentApplyList, params));
}

// 删除付款申请单
export async function deletePaymentApply(id) {
  return request.patch(toUrl(removePaymentApply, { id }));
}

// 付款申请单提交流程
export async function postPaymentApplyFlowSubmit(id) {
  return request.post(toUrl(paymentApplyFlowSubmit, { id }));
}

// 付款申请单退回第一个节点的提交
export async function postPaymentAppFirstFlowSubmit(param) {
  return request.post(toUrl(paymentAppFirstFlowSubmit, { id: param.id }), {
    body: param.flow,
  });
}

// 获取银行名称
export async function selectApplyAccounts(accountNo) {
  return request.get(toUrl(paymentApplyAccounts, { accountNo }));
}

// 获取银行账号
export async function selectAccountByNo(abNo) {
  return request.get(toUrl(paymentApplyAccountsNo, { abNo }));
}
// 预付款保存
export async function postPrePaymentApplySave(data) {
  return request.post(prePaymentApplySave, {
    body: data,
  });
}

// 预付款更新
export async function postPrePaymentApplyUpdate(data) {
  return request.put(prePaymentApplyUpdate, {
    body: data,
  });
}

// 获取发票号
export async function getPaymentApplyInvoices({ type, invoiceNo }) {
  return request.get(toUrl(paymentApplyInvoices, { type, invoiceNo }));
}

// 获取发票号详情
export async function getInvoicesDetail(invoiceNo) {
  return request.get(toUrl(paymentApplyInvoicesDetail, { invoiceNo }));
}

paymentApplyOpportunity;

// 获取商机
export async function getPaymentApplyOpportunity() {
  return request.get(paymentApplyOpportunity);
}

// 获取科目模版
export async function getPaymentApplyTempds(code) {
  return request.get(toUrl(paymentApplyTempds, { code }));
}

// 付款单记录保存
export async function postPaymentSlipSave(data) {
  return request.post(paymentSlipSave, {
    body: data,
  });
}

// 付款单记录更新
export async function postPaymentSlipUpdate(data) {
  return request.put(paymentSlipUpdate, {
    body: data,
  });
}

// 付款单记录删除
export async function patchPaymentSlipDelete(id) {
  return request.patch(toUrl(paymentSlipDelete, { id }));
}

// 付款单记录提交流程
export async function postPaymentSlipFlowSubmit(id) {
  return request.post(toUrl(paymentSlipFlowSubmit, { id }));
}
// 付款单记录提交流程
export async function postpaymentSlipFlowReSubmit(param) {
  return request.post(toUrl(paymentSlipFlowReSubmit, { id: param.id }), {
    body: param.flow,
  });
}

// 根据筛选条件获取付款记录列表
export async function getPaymentSlipView(params) {
  return request.get(toQs(paymentSlipView, params));
}

// 根据前置单据和场景获取单据号
export async function getPaymentApplyByDocNoScene(docNo, scene) {
  return request.get(toUrl(paymentApplyByDocNoScene, { docNo, scene }));
}

// 预付款：根据前置单据和场景获取采购合同信息
export async function getPurchaseByDoc(docNo) {
  return request.get(purchaseByDoc.replace('{no}', docNo));
}

// 获取付款记录详情
export async function getPaymentSlipDetailById(id) {
  return request.get(toUrl(paymentSlipDetailById, { id }));
}

// 预付款核销单据号下拉框
export async function getPaymentApplyWriteoffSelect(docType, supplierLegalNo) {
  return request.get(toUrl(paymentApplyWriteoffSelect, { docType, supplierLegalNo }));
}

// 付款核销单据号获取详情
export async function getPaymentWriteoffNoAndTypeDetail(docNo, docType) {
  return request.get(toUrl(paymentWriteoffNoAndType, { docNo, docType }));
}

// 根据付款申请单ID获取付款单记录列表
export async function getPaymentSlipListById(paymentApplyId) {
  return request.get(toUrl(paymentSlipListById, { paymentApplyId }));
}

// 根据前置单据号获取费率
export async function getPaymentApplyCalcAmt(agreementNo, amt) {
  return request.get(toUrl(paymentApplyCalc, { agreementNo, amt }));
}

// 付款记录批量提交 ()
export async function postPaymentSlipFlowBatchSubmit(data) {
  return request.post(paymentSlipFlowBatchSubmit, {
    body: { entities: data },
  });
}

// 付款记录批量
export async function postPaymentSlipBatchOperation(data) {
  return request.post(paymentSlipBatchOperation, {
    body: { entities: data, action: '1' },
  });
}
// 付款记录的审批和状态流转
// 列表查询
export async function paymentSlipListRq(params) {
  return request.get(toQs(paymentSlipList, params));
}

// 批量操作付款单记录
export async function batchOperationOperateRq(params) {
  return request.post(batchOperationOperate, {
    body: params,
  });
}

// 根据付款申请单编号获取ID
export async function getPaymentApplyIdByDoc(docNo) {
  return request.get(paymentApplyIdByDoc.replace('{no}', docNo));
}

// 根据采购协议编号查询协议ID
export async function getPurchaseAgreementIdByDoc(docNo) {
  return request.get(purchaseAgreementIdByDoc.replace('{no}', docNo));
}

// 根据采购合同编号查询采购合同ID
export async function getPurchaseContractIdByDoc(docNo) {
  return request.get(purchaseContractIdByDoc.replace('{no}', docNo));
}
