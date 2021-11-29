import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { acc } = api.production;

// 会计科目
export async function financialAccSubjCreate(param) {
  return request.post(acc.financialAccSubjCreateUri, { body: param });
}
export async function financialAccSubjOverallModify(param) {
  return request.put(acc.financialAccSubjOverallModifyUri, { body: param });
}
export async function financialAccSubjPartialModify(param) {
  return request.put(acc.financialAccSubjPartialModifyUri, { body: param });
}
export async function financialAccSubjDetail(param) {
  return request.get(toUrl(acc.financialAccSubjDetailUri, param));
}
export async function financialAccSubjListPaging(param) {
  return request.get(toQs(acc.financialAccSubjListPagingUri, param));
}
export async function financialAccSubjLogicalDelete(param) {
  return request.patch(toQs(acc.financialAccSubjLogicalDeleteUri, param));
}

// 预算项目
export async function budgetItemCreate(param) {
  return request.post(acc.budgetItemCreateUri, { body: param });
}
export async function budgetItemOverallModify(param) {
  return request.put(acc.budgetItemOverallModifyUri, { body: param });
}
export async function budgetItemPartialModify(param) {
  return request.put(acc.budgetItemPartialModifyUri, { body: param });
}
export async function budgetItemDetail(param) {
  return request.get(toUrl(acc.budgetItemDetailUri, param));
}
export async function budgetItemListPaging(param) {
  return request.get(toQs(acc.budgetItemListPagingUri, param));
}
export async function budgetItemLogicalDelete(param) {
  return request.patch(toQs(acc.budgetItemLogicalDeleteUri, param));
}

// 核算项目
export async function businessAccItemCreate(param) {
  return request.post(acc.businessAccItemCreateUri, { body: param });
}
export async function businessAccItemOverallModify(param) {
  return request.put(acc.businessAccItemOverallModifyUri, { body: param });
}
export async function businessAccItemPartialModify(param) {
  return request.put(acc.businessAccItemPartialModifyUri, { body: param });
}
export async function businessAccItemDetail(param) {
  return request.get(toUrl(acc.businessAccItemDetailUri, param));
}
export async function businessAccItemListPaging(param) {
  return request.get(toQs(acc.businessAccItemListPagingUri, param));
}
export async function businessAccItemLogicalDelete(param) {
  return request.patch(toQs(acc.businessAccItemLogicalDeleteUri, param));
}

// 科目模板管理（产品化）

// 新增科目模板管理
export async function subjectTemplateCreate(param) {
  return request.post(acc.subjectTemplateCreateUri, { body: param });
}

// 全量修改用科目模板管理
export async function subjectTemplateOverallModify(param) {
  return request.put(acc.subjectTemplateOverallModifyUri, { body: param });
}

// 查看科目模板管理详情
export async function subjectTemplateDetail(param) {
  return request.get(toUrl(acc.subjectTemplateDetailUri, param));
}

// 科目模板管理列表
export async function subjectTemplateListPaging(param) {
  return request.get(toQs(acc.subjectTemplateListPagingUri, param));
}

// 逻辑删除科目模板管理
export async function subjectTemplateLogicalDelete(param) {
  return request.patch(toQs(acc.subjectTemplateLogicalDeleteUri, param));
}

// 部分修改科目模板管理
export async function subjectTemplatePartialModify(param) {
  return request.put(acc.subjectTemplatePartialModifyUri, { body: param });
}
// 科目模板预算树
export async function subjectTemplateBudgetTree(param) {
  return request.get(toUrl(acc.subjectTemplateBudgetTreeUri, param));
}

// 同步数据
export async function insertAccToU8cRp(params) {
  return request.post(toUrl(acc.insertAccToU8c, params));
}
