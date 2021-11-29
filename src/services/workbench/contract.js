import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  // =======合同管理=======
  pcontractSave,
  pcontractSubmit,
  pcontractOverall,
  pcontractPartial,
  pcontractChangeStatus,
  pcontractDelete,
  pcontractDetail,
  pcontractPaging,
  pcontractRelatedDocs,
  // =======规则模板管理=======
  rulesTemplateSave,
  rulesTemplateOverall,
  rulesTemplateDelete,
  rulesTemplatePaging,
  rulesTemplateDetail,
  rulesTemplateChangeDisable,
  rulesTemplateRulesDetail,
} = api.workbench.contract;

// =====================规则模板管理======================

// 规则模版管理-列表查询接口
export async function rulesTemplateRulesDetailRq(payload) {
  return request.get(toUrl(rulesTemplateRulesDetail, payload));
}

// 规则模版管理-新增接口
export async function rulesTemplateSaveRq(params) {
  return request.post(rulesTemplateSave, {
    body: params,
  });
}

// 规则模版管理-整体更新接口
export async function rulesTemplateOverallRq(params) {
  return request.put(rulesTemplateOverall, {
    body: params,
  });
}

// 规则模版管理-删除接口
export async function rulesTemplateDeleteRq(params) {
  return request.patch(toUrl(rulesTemplateDelete, params));
}

// 规则模版管理-列表查询接口
export async function rulesTemplatePagingRq(payload) {
  return request.get(toQs(rulesTemplatePaging, payload));
}

// 合同管理-详情接口 GET
export async function rulesTemplateDetailRq(payload) {
  return request.get(toUrl(rulesTemplateDetail, payload));
}

// 规则模板-有效变无效
export async function rulesTemplateChangeDisableRq(id) {
  return request.patch(toUrl(rulesTemplateChangeDisable, id));
}

// =====================合同管理=====================
// 合同管理-保存接口 post
export async function pcontractSaveRq(params) {
  return request.post(pcontractSave, {
    body: params,
  });
}

// 合同管理-提交接口post
export async function pcontractSubmitRq(params) {
  return request.post(pcontractSubmit, {
    body: params,
  });
}

// 合同管理-整体更新接口 PUT
export async function pcontractOverallRq(params) {
  return request.put(pcontractOverall, {
    body: params,
  });
}

// 合同管理-指定更新接口 PUT
export async function pcontractPartialRq(params) {
  return request.put(pcontractPartial, {
    body: params,
  });
}

// 合同管理-删除接口 PATCH
export async function pcontractDeleteRq(id) {
  return request.patch(toUrl(pcontractDelete, id));
}

// 合同管理-激活关闭接口 PUT
export async function pcontractChangeStatusRq(params) {
  const { ids, contractStatus, ...newParams } = params;
  return request.put(toUrl(pcontractChangeStatus, { ids, contractStatus }), {
    body: newParams,
  });
}

// 合同管理-详情接口 GET
export async function pcontractDetailRq(payload) {
  return request.get(toUrl(pcontractDetail, payload));
}

// 合同管理-列表查询接口 GET
export async function pcontractPagingRq(payload) {
  return request.get(toQs(pcontractPaging, payload));
}

// 合同管理-相关单据查询接口 GET
export async function pcontractRelatedDocsRq(payload) {
  return request.get(toQs(pcontractRelatedDocs, payload));
}
