import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  // =======产品列表管理=======
  productManagementSave,
  productManagementOverall,
  productManagementPartial,
  productManagementDelete,
  productManagementDetail,
  productManagementaPging,
  // =======项目列表管理=======
  projectManagementSave,
  projectManagementOverall,
  projectManagementPartial,
  projectManagementDelete,
  projectManagementPging,
  projectManagementDetail,
  // =======项目成员管理=======
  projectMemberPage,
  projectMemberSave,
  projectMemberOverall,
  projectMemberDetail,
  projectMemberDelete,
  // 项目计划
  projectPlanIncrease,
  projectPlanOverall,
  projectPlanPartial,
  projectPlanDelete,
  projectPlanDetail,
  projectPlanList,
  planMember,
  excelImport,
  // 项目阶段
  projectPhaseIncrease,
  projectPhaseOverall,
  projectPhasePartial,
  projectPhaseDelete,
  projectPhaseDetail,
  projectPhaseList,
  // WBS详情查询
  wbsTree,
  // 项目进度管理
  dailyPaging,
  dailyIncrease,
  dailyOverall,
  dailyPartiall,
  dailyDelete,
  dailyDetail,
  dailyPlanDetail,
  dailyReportDetail,
  progressUpdate,
  noticeResIdByDailyId,
  // 项目周报
  weeklyPging,
  weeklyIncrease,
  weeklyOverall,
  weeklyPartial,
  weeklyDelete,
  weeklyDetail,
  weeklyDailyDetail,
  // 项目概览
  projectOverview,
  // 销售单管理
  projectRiskPaging,
  projectRiskIncrease,
  projectRiskOverall,
  projectRiskPartial,
  projectRiskDelete,
  projectRiskDetail,

  //项目模板管理
  projectTemplatePaging,
  projectTemplateIncrease,
  projectTemplatePartial,
  projectTemplateOverall,
  projectTemplateDelete,
  projectTemplateDetail,

  //成员模板管理
  peopTemplatePaging,
  peopTemplateIncrease,
  peopTemplatePartial,
  peopTemplateOverall,
  peopTemplateDelete,
  peopTemplateDetail,

  // WBS
  WBSTemplatePaging,
  //项目阶段
  templatePhasePaging,
  templatePhaseIncrease,
  templatePhasePartial,
  templatePhaseOverall,
  templatePhaseDelete,
  templatePhaseDetail,
  //项目计划
  templatePlanPaging,
  templatePlanIncrease,
  templatePlanPartial,
  templatePlanOverall,
  templatePlanDelete,
  templatePlanDetail,
} = api.workbench.project;

const { projectTemplate } = api.production.common;

// =====================WBS======================
// 列表
export async function WBSTemplatePagingRq(payload) {
  return request.get(toQs(WBSTemplatePaging, payload));
}
// ======================模板/项目阶段=======================
// 模板/项目阶段列表
export async function templatePhasePagingRq(payload) {
  return request.get(toQs(templatePhasePaging, payload));
}
//模板/项目阶段新增
export async function templatePhaseIncreaseRq(params) {
  return request.post(templatePhaseIncrease, {
    body: params,
  });
}
// 模板/项目阶段指定更新
export async function templatePhasePartialRq(params) {
  return request.put(templatePhasePartial, {
    body: params,
  });
}
// 模板/项目阶段整体更新
export async function templatePhaseOverallRq(params) {
  return request.put(templatePhaseOverall, {
    body: params,
  });
}
// 模板/项目阶段删除
export async function templatePhaseDeleteRq(params) {
  return request.patch(toUrl(templatePhaseDelete, params));
}
// 模板/项目阶段详情
export async function templatePhaseDetailRq(params) {
  return request.get(toUrl(templatePhaseDetail, params));
}
//========================模板/项目计划=======================
// 模板/项目计划列表
export async function templatePlanPagingRq(payload) {
  return request.get(toQs(templatePlanPaging, payload));
}
//模板/项目计划新增
export async function templatePlanIncreaseRq(params) {
  return request.post(templatePlanIncrease, {
    body: params,
  });
}
// 模板/项目计划指定更新
export async function templatePlanPartialRq(params) {
  return request.put(templatePlanPartial, {
    body: params,
  });
}
// 模板/项目计划整体更新
export async function templatePlanOverallRq(params) {
  return request.put(templatePlanOverall, {
    body: params,
  });
}
// 模板/项目计划删除
export async function templatePlanDeleteRq(params) {
  return request.patch(toUrl(templatePlanDelete, params));
}
// 模板/项目计划详情
export async function templatePlanDetailRq(params) {
  return request.get(toUrl(templatePlanDetail, params));
}

// =====================模板/成员模板======================
// 模板/列表
export async function peopTemplatePagingRq(payload) {
  return request.get(toQs(peopTemplatePaging, payload));
}
// 模板/整体更新
export async function peopTemplateOverallRq(params) {
  return request.put(peopTemplateOverall, {
    body: params,
  });
}
// 模板/新增
export async function peopTemplateIncreaseRq(params) {
  return request.post(peopTemplateIncrease, {
    body: params,
  });
}
// 模板/指定更新
export async function peopTemplatePartialRq(params) {
  return request.put(peopTemplatePartial, {
    body: params,
  });
}
// 模板/详情
export async function peopTemplateDetailRq(params) {
  return request.get(toUrl(peopTemplateDetail, params));
}
// 模板/删除
export async function peopTemplateDeleteRq(params) {
  return request.patch(toUrl(peopTemplateDelete, params));
}

// =====================项目模板======================
// 项目模板列表
export async function projectTemplatePagingRq(payload) {
  return request.get(toQs(projectTemplatePaging, payload));
}
// 项目模板新增
export async function projectTemplateIncreaseRq(params) {
  return request.post(projectTemplateIncrease, {
    body: params,
  });
}
// 项目模板指定更新
export async function projectTemplatePartialRq(params) {
  return request.put(projectTemplatePartial, {
    body: params,
  });
}
// 项目模板整体更新
export async function projectTemplateOverallRq(params) {
  return request.put(projectTemplateOverall, {
    body: params,
  });
}
// 项目模板详情
export async function projectTemplateDetailRq(params) {
  return request.get(toUrl(projectTemplateDetail, params));
}
// 项目模板删除
export async function projectTemplateDeleteRq(params) {
  return request.patch(toUrl(projectTemplateDelete, params));
}

// =====================销售单管理======================
// 列表
export async function projectRiskPagingRq(payload) {
  return request.get(toQs(projectRiskPaging, payload));
}
// 新增
export async function projectRiskIncreaseRq(params) {
  return request.post(projectRiskIncrease, {
    body: params,
  });
}
// 整体更新
export async function projectRiskOverallRq(params) {
  return request.put(projectRiskOverall, {
    body: params,
  });
}
// 指定更新
export async function projectRiskPartialRq(params) {
  return request.put(projectRiskPartial, {
    body: params,
  });
}
// 详情
export async function projectRiskDetailRq(params) {
  return request.get(toUrl(projectRiskDetail, params));
}
// 删除
export async function projectRiskDeleteRq(params) {
  return request.patch(toUrl(projectRiskDelete, params));
}

// =====================项目概览======================
// 详情
export async function projectOverviewRq(params) {
  return request.get(toUrl(projectOverview, params));
}

// =====================项目周报======================
// 详情
export async function weeklyDailyDetailRq(params) {
  return request.get(toUrl(weeklyDailyDetail, params));
}
// 列表
export async function weeklyPgingRq(payload) {
  return request.get(toQs(weeklyPging, payload));
}
// 新增
export async function weeklyIncreaseRq(params) {
  return request.post(weeklyIncrease, {
    body: params,
  });
}
// 整体更新
export async function weeklyOverallRq(params) {
  return request.put(weeklyOverall, {
    body: params,
  });
}
// 指定更新
export async function weeklyPartialRq(params) {
  return request.put(weeklyPartial, {
    body: params,
  });
}
// 详情
export async function weeklyDetailRq(params) {
  return request.get(toUrl(weeklyDetail, params));
}
// 删除
export async function weeklyDeleteRq(params) {
  return request.patch(toUrl(weeklyDelete, params));
}

// =====================项目进度管理-报告和计划所有详情======================
// 详情
export async function dailyDetailRq(params) {
  return request.get(toUrl(dailyDetail, params));
}

// =====================项目进度管理-报告======================
// 详情
export async function dailyReportDetailRq(params) {
  return request.get(toUrl(dailyReportDetail, params));
}
// =====================项目进度管理-计划======================
// 列表
export async function dailyPagingRq(payload) {
  return request.get(toQs(dailyPaging, payload));
}
// 新增
export async function dailyIncreaseRq(params) {
  return request.post(dailyIncrease, {
    body: params,
  });
}
// 整体更新
export async function dailyOverallRq(params) {
  return request.put(dailyOverall, {
    body: params,
  });
}
// 指定更新
export async function dailyPartiallRq(params) {
  return request.put(dailyPartiall, {
    body: params,
  });
}
// 详情
export async function dailyPlanDetailRq(params) {
  return request.get(toUrl(dailyPlanDetail, params));
}
// 删除
export async function dailyDeleteRq(params) {
  return request.patch(toUrl(dailyDelete, params));
}

export async function noticeResIdByDailyIdRq(params) {
  return request.get(toUrl(noticeResIdByDailyId, params));
}

// =====================WBS详情查询======================
// 列表
export async function wbsTreeRq(payload) {
  return request.get(toQs(wbsTree, payload));
}

// =====================项目阶段======================
// 列表
export async function projectPhaseListRq(payload) {
  return request.get(toQs(projectPhaseList, payload));
}
// 新增
export async function projectPhaseIncreaseRq(params) {
  return request.post(projectPhaseIncrease, {
    body: params,
  });
}
// 整体更新
export async function projectPhaseOverallRq(params) {
  return request.put(projectPhaseOverall, {
    body: params,
  });
}
// 指定更新
export async function projectPhasePartialRq(params) {
  return request.put(projectPhasePartial, {
    body: params,
  });
}
// 详情
export async function projectPhaseDetailRq(params) {
  return request.get(toUrl(projectPhaseDetail, params));
}
// 删除
export async function projectPhaseDeleteRq(params) {
  return request.patch(toUrl(projectPhaseDelete, params));
}

// =====================项目计划======================
// 列表
export async function projectPlanListRq(payload) {
  return request.get(toQs(projectPlanList, payload));
}
// 新增
export async function projectPlanIncreaseRq(params) {
  return request.post(projectPlanIncrease, {
    body: params,
  });
}
// 整体更新
export async function projectPlanOverallRq(params) {
  return request.put(projectPlanOverall, {
    body: params,
  });
}
// 指定更新
export async function projectPlanPartialRq(params) {
  return request.put(projectPlanPartial, {
    body: params,
  });
}
// 详情
export async function projectPlanDetailRq(params) {
  return request.get(toUrl(projectPlanDetail, params));
}
// 删除
export async function projectPlanDeleteRq(params) {
  return request.patch(toUrl(projectPlanDelete, params));
}
// 计划相关成员
export async function planMemberRq(payload) {
  return request.get(toQs(planMember, payload));
}
// excel导入
export async function excelImportRq(payload) {
  return request.post(excelImport, {
    body: payload,
  });
}

// =====================项目成员管理======================
// 列表查询接口
export async function projectMemberPageRq(payload) {
  return request.get(toQs(projectMemberPage, payload));
}

// 新增接口
export async function projectMemberSaveRq(params) {
  return request.post(projectMemberSave, {
    body: params,
  });
}

// 整体更新接口
export async function projectMemberOverallRq(params) {
  return request.put(projectMemberOverall, {
    body: params,
  });
}

// 详情接口
export async function projectMemberDetailRq(params) {
  return request.patch(toUrl(projectMemberDetail, params));
}

// 删除接口
export async function projectMemberDeleteRq(params) {
  return request.patch(toUrl(projectMemberDelete, params));
}

// =====================产品列表管理======================
// 项目模板公共下拉
export async function projectTemplateRq(payload) {
  return request.get(toUrl(projectTemplate, { ...payload, limit: 0 }));
}

// =====================产品列表管理======================

// 列表查询接口
export async function projectManagementDetailRq(payload) {
  return request.get(toUrl(projectManagementDetail, payload));
}

// 新增接口
export async function projectManagementSaveRq(params) {
  return request.post(projectManagementSave, {
    body: params,
  });
}

// 整体更新接口
export async function projectManagementOverallRq(params) {
  return request.put(projectManagementOverall, {
    body: params,
  });
}

// 指定更新接口 PUT
export async function projectManagementPartialRq(params) {
  return request.put(projectManagementPartial, {
    body: params,
  });
}

// 删除接口
export async function projectManagementDeleteRq(params) {
  return request.patch(toUrl(projectManagementDelete, params));
}

// 列表查询接口
export async function projectManagementPgingRq(payload) {
  return request.get(toQs(projectManagementPging, payload));
}

// =====================项目列表管理====================
// 保存接口 post
export async function productManagementSaveRq(params) {
  return request.post(productManagementSave, {
    body: params,
  });
}

// 整体更新接口 PUT
export async function productManagementOverallRq(params) {
  return request.put(productManagementOverall, {
    body: params,
  });
}

// 指定更新接口 PUT
export async function productManagementPartialRq(params) {
  return request.put(productManagementPartial, {
    body: params,
  });
}

// 删除接口 PATCH
export async function productManagementDeleteRq(id) {
  return request.patch(toUrl(productManagementDelete, id));
}

// 详情接口 GET
export async function productManagementDetailRq(payload) {
  return request.get(toUrl(productManagementDetail, payload));
}

// 列表查询接口 GET
export async function productManagementaPgingRq(payload) {
  return request.get(toQs(productManagementaPging, payload));
}
