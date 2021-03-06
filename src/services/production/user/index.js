import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { user } = api.production;

export async function informationListPaging(param) {
  return request.get(toQs(user.informationListPagingUri, param));
}

export async function informationDetail(param) {
  return request.get(toUrl(user.informationDetailUri, param));
}

export async function openAccount(param) {
  return request.get(toQs(user.openAccountUri, param));
}

export async function modifyInformation(param) {
  return request.put(user.modifyInformationUri, { body: param });
}

export async function informationImport(payload) {
  return request.post(user.informationImport, {
    body: payload,
  });
}

export async function loanListPaging(param) {
  return request.get(toQs(user.loanListPagingUri, param));
}

// 员工信息导出所选字段
export async function exportEmployeeInformation(payload) {
  return request.get(toQs(user.exportEmployee, payload));
}

// 获取模板
export async function templateList() {
  return request.get(user.templateList);
}

// 员工异动提交
export async function tranSubmit(payload) {
  return request.put(user.transactionSub, { body: payload });
}

// 员工异动记录
export async function changeList(param) {
  return request.get(toQs(user.changeList, param));
}

// 员工异动流程详情
export async function informationFlowDetail(param) {
  return request.get(toUrl(user.informationFlowDetailUri, param));
}

// 试用期考核提交
export async function informationAssSubmit(payload) {
  return request.post(user.informationAssSubUri, { body: payload });
}

// 试用期考核流程详情
export async function informationAssFlowDetail(param) {
  return request.get(toUrl(user.informationAssFlowDetail, param));
}

export async function informationAssOverAll(payload) {
  return request.put(user.informationAssOverAllUri, { body: payload });
}

// 员工离职申请提交
export async function informationLeaveApply(payload) {
  return request.post(user.informationLeaveApply, { body: payload });
}
// 员工离职流程
export async function informationLeaveOverAll(payload) {
  return request.put(user.informationLeaveOverAllUri, { body: payload });
}

// 离职流程详情
export async function informationLeaveFlowDetail(param) {
  return request.get(toUrl(user.informationLeaveFlowDetail, param));
}
