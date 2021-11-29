import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  // 利益分配模板字段类型配置
  saveBusinessTableFieldType,
  saveBusinessTableFieldTypeDetail,
  field,
  // 利益分配模板
  functionList,
  proConAndproFac,
  saveUpdateProConAndproFac,
  proConAndproFacDetail,
  proConAndproFacList,
  proConAndproFacDel,
  updateProStatus,
  // 利益分配规则模板
  templateName,
  profitCondition,
  roleField,
  saveProfitdistFunction,
  // 利益分配规则列表
  templateNameList,
  profitConditionTableCol,
  profitConditionSave,
  profitConditionDetail,
  profitConditionDelete,
  updateStatus,
} = api.plat.distInfoMgmt;
// ============================利益分配规则=================
// get 改变启用状态
export async function updateStatusRq(params) {
  return request.post(toUrl(updateStatus, params));
}
// get 列表删除
export async function profitConditionDeleteRq(params) {
  return request.delete(toUrl(profitConditionDelete, params));
}
// post 保存/修改
export async function profitConditionSaveRq(params) {
  return request.post(profitConditionSave, {
    body: params,
  });
}
// get 详情
export async function profitConditionDetailRq(params) {
  return request.get(toQs(profitConditionDetail, params));
}
// get 利益分配条件和利益分配对象的表头
export async function profitConditionTableColRq(params) {
  return request.get(toUrl(profitConditionTableCol, params));
}

// get 模板名称下拉框
export async function templateNameListRq(params) {
  return request.get(toUrl(templateNameList, params));
}

// ============================利益分配模板字段类型配置=================

// get 业务功能所有字段
export async function updateProStatusRq(params) {
  return request.post(toUrl(updateProStatus, params));
}

// get 业务功能所有字段
export async function fieldRq(params) {
  return request.get(toUrl(field, params));
}

// get 利益分配对象 及比列表头
export async function saveBusinessTableFieldTypeDetailRq(params) {
  return request.get(toUrl(saveBusinessTableFieldTypeDetail, params));
}

// post 保存/修改
export async function saveBusinessTableFieldTypeRq(params) {
  return request.post(saveBusinessTableFieldType, {
    body: params,
  });
}

// ============================利益分配规则=================
// post 保存/修改
export async function saveProfitdistFunctionRq(params) {
  return request.post(saveProfitdistFunction, {
    body: params,
  });
}

// get 利益分配对象 及比列表头
export async function roleFieldRq(params) {
  return request.get(toUrl(roleField, params));
}

// get 利益分配条件
export async function profitConditionRq(params) {
  return request.get(toUrl(profitCondition, params));
}

// get 模板名称下拉框
export async function templateNameRq(params) {
  return request.get(toQs(templateName, params));
}

//  ============================利益分配模板=============
// delete 利益模板列表删除
export async function proConAndproFacDelRq(params) {
  return request.delete(toUrl(proConAndproFacDel, params));
}

// get 利益分配模板列表
export async function proConAndproFacListRq(params) {
  return request.get(toQs(proConAndproFacList, params));
}

// get 利益模板详情
export async function proConAndproFacDetailRq(params) {
  return request.get(toUrl(proConAndproFacDetail, params));
}

// get 业务功能下拉框
export async function functionListRq(params) {
  return request.get(toQs(functionList, params));
}

// get 利益分配条件/利益分配对象
export async function proConAndproFacRq(params) {
  return request.get(toUrl(proConAndproFac, params));
}

// post 利益模板新增/修改
export async function saveUpdateProConAndproFacRq(params) {
  return request.post(saveUpdateProConAndproFac, {
    body: params,
  });
}
