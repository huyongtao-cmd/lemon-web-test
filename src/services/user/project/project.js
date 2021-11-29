import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  projects,
  myProjects,
  project,
  projectSimple,
  projectSave,
  projectTmplSelect,
  projectSelect,
  projectSelectConditional,
  projectSh,
  projectShTree,
  projectShList,
  projectShDel,
  projectActivitys,
  workbenchProjectActivitys,
  workbenchTaskRes,
  workbenchTaskResComprehensive,
  workbenchProfile,
  totalDistedAndSettledEqvq,
  resPlanning,
  resPlanningById,
  resPlanningHistory,
  templateResPlanningList,
  templateResPlanningUpdate, // 商机模板新增
  templateResPlanningDetail,
  templateResPlanningDelete,
  businessResPlanningDetail,
  feeBudget,
  feeBudgetById,
  feeBudgetTemplateTree,
  feeBudgetSave,
  abstractChangeDetailByProjId,
  abstractChangeDetailById,
  abstractChangeDetailUpdate,
  changeBudgetByProjId,
  createChangeBudgetByProjId,
  changeBudgetSave,
  ChangeBudgetHistoryList,
  ledgerIoByProj,
  projectLedger,
  projectLedgerIo,
  projectExpenseInfo,
  projectExpenseList,
  projectProfitReport,
  projExecutionInfo,
  projDaysEqvaMonthly,
  projReim,
  projDaysEqvaDaily,
  projReimDetail,
  projTimeSheetDetail,
  projPurchaseContractDetail,
  getReportApi,
  getReportAjax,
  briefInfo,
  briefInfoCreate,
  briefInfoModify,
  briefInfoListPaging,
  briefInfoLogicalDelete,
  briefInfoLogicalDetail,
  briefInfoProcStart,
  projectLaborUpload,
  distInfoProject,
  distInfoProjectSave,
  projectTemplateListPaging,
  projectTemplateLogicalDelete,
  projectTemplateToggleEnabled,
  projectTemplateCreate,
  projectTemplateModify,
  projectTemplateDetail,
  phaseSettleListFindTimeSheetUri,
  phaseSettleListCreateUri,
  phaseSettleListModifyUri,
  phaseSettleListListPagingUri,
  phaseSettleListDetailUri,
  projClosureApplySave,
  projClosureApplyList,
  projClosureApplyDetails,
  projClosureApplyDelete,
  pmProject,
  getResultsByProj,
  checkresultSave,
  checkresult,
  evalInfo,
  evalSave,
  getPoint,
  projResSelect,
  getAllExtrwork,
  getExtrworkDetail,
  extrworkSave,
  extrworkDel,
  myExtrwork,
  ExtrworkByResId,
  extrworkRecentwork,
  extrworkVacation,
  extrworkCanEdit,
  extrworkCheck,
  addVacation,
  projectLaborCreateUri,
  projectLaborModifyUri,
  projectLaborDetailUri,
  projectLaborListPagingUri,
  projectLaborLogicalDeleteUri,
  noContractList, // 无合同项目列表
  noContractDetail, // 无合同项目详情
  noContractFlow, // 无合同项目流程发起和修改
  // 预算拨付
  budgetAppropriationCreateUri,
  budgetAppropriationModifyUri,
  budgetAppropriationDetailUri,
  budgetAppropriationListPagingUri,
  budgetAppropriationLogicalDeleteUri,
  budgetCompareUri,
  closeAccounting,
  // 项目立项
  setUpProjectListUri,
  setUpProjectCreateUri,
  setUpProjectBUDetailUri,
  setUpProjectBUCreateUri,
  setUpProjectCreateDetail,
  contractSourceUri,
  contractSourceDetailUri,
  setUpProjectSalesManCreateUri,
  setUpProjectPmoCreateUri,
  setUpProjectProjManagerCreateUri,
  setUpProjectListDeleteUri,
} = api.user.project;
const { checkDistribute } = api.user.distribute;

export async function projectClosAcc(projectId) {
  return request.put(toUrl(closeAccounting, { projectId }));
}

export async function findProjectList(params) {
  return request.get(toQs(projects, params));
}

export async function findMyProjectList(params) {
  return request.get(toQs(myProjects, params));
}

export async function findProjectById(id) {
  return request.get(toUrl(project, { id }));
}

export async function findProjectByIdSimple(id) {
  return request.get(toUrl(projectSimple, { id }));
}

export async function create(params) {
  return request.post(projectSave, {
    body: params,
  });
}

export async function update(params) {
  return request.put(projectSave, {
    body: params,
  });
}

export async function selectProjectTmpl() {
  return request.get(projectTmplSelect);
}

export async function selectProject() {
  return request.get(projectSelect);
}

export async function selectProjectConditional(param) {
  return request.get(toQs(projectSelectConditional, param));
}

// 判断是否可以派发
export async function checkDist(params) {
  return request.get(toQs(checkDistribute, params));
}

// ===========项目成员===========================

export async function findProjectShByProjId(params) {
  return request.get(toQs(projectSh, params));
}

export async function findProjectShTreeByProjId(params) {
  return request.get(toQs(projectShTree, params));
}
export async function findProjectShListByProjId(params) {
  return request.get(toQs(projectShList, params));
}

export async function projectShCreate(params) {
  return request.post(projectSh, {
    body: params,
  });
}

export async function projectShUpdate(params) {
  return request.put(projectSh, {
    body: params,
  });
}

export async function deleteProjectShs(ids) {
  return request.patch(toUrl(projectShDel, { ids: ids.join(',') }));
}

// ============项目活动=======================

export async function findProjectActivityByProjId(projId) {
  return request.get(toUrl(projectActivitys, { projId }));
}

export async function projectActivitySave(params) {
  return request.put(toUrl(projectActivitys, { projId: params.projId }), {
    body: params,
  });
}

// 工作台项目活动
export async function findWorkbenchProjectActivityByProjId(projId) {
  return request.get(toUrl(workbenchProjectActivitys, { projId, workbenchQueryFlag: 1 }));
}

// 工作台项目任务资源综合任务
export async function findorkbenchTaskResComprehensive(projId, projShId) {
  return request.get(toQs(workbenchTaskResComprehensive, { projId, projShId }));
}
// 工作台项目概况
export async function findWorkbenchProfile(projId) {
  return request.get(toUrl(workbenchProfile, { projId }));
}

// 工作台项目任务资源
export async function findorkbenchTaskResByProjId(projId, offset, limit) {
  return request.get(toQs(workbenchTaskRes, { projId, offset, limit }));
}
// 工作台项目特殊结算任务汇总
export async function findTotalDistedAndSettledEqvq(projId) {
  return request.get(toUrl(totalDistedAndSettledEqvq, { projId }));
}

// ==================资源计划========================

export async function findProjectResPlanningBy(params) {
  return request.get(toQs(resPlanning, params));
}

export async function findResPlanningById(id) {
  return request.get(toUrl(resPlanningById, { id }));
}

export async function createResPlanning(params) {
  return request.post(resPlanning, {
    body: params,
  });
}
// 商机模板管理列表
export async function templateResPlanningListUri(params) {
  return request.get(toQs(templateResPlanningList, params));
}
// 商机模板管理编辑（新增+修改）
export async function templateResPlanningUpdateUri(params) {
  return request.post(templateResPlanningUpdate, {
    body: params,
  });
}
// 商机模板管理详情
export async function templateResPlanningDetailUri(id) {
  return request.get(toUrl(templateResPlanningDetail, id));
}
// 商机模板管理删除
export async function templateResPlanningDeleteUri(payload) {
  return request.patch(toUrl(templateResPlanningDelete, payload));
}
// 从商机导入
export async function businessResPlanningDetailUri(id) {
  return request.get(toUrl(businessResPlanningDetail, id));
}

// =============资源规划变更历史================

export async function findPlanningHistoryBy(params) {
  return request.get(toQs(resPlanningHistory, params));
}

export async function createResPlanningHistory(params) {
  return request.post(resPlanningHistory, {
    body: params,
  });
}

// ===============项目费用预算=======================

export async function findFeeBudgetByProjId(projId) {
  return request.get(toUrl(feeBudget, projId));
}

export async function findFeeBudgetById(id) {
  return request.get(toUrl(feeBudgetById, id));
}

export async function findFeeBudgetTemplateTreeByProjId(projId) {
  return request.get(toUrl(feeBudgetTemplateTree, projId));
}

export async function saveFeeBudget(params) {
  return request.put(feeBudgetSave, {
    body: params,
  });
}

// 预算变更的抽象变更功能通过项目id查询
export async function abstractChangeDetailByProjIdUri(params) {
  return request.get(toQs(abstractChangeDetailByProjId, params));
}
// 预算变更的抽象变更功能通过流程地址栏的id查询
export async function abstractChangeDetailByIdUri(id) {
  return request.get(toUrl(abstractChangeDetailById, id));
}
// 预算变更的抽象变更功能修改变更意见
export async function abstractChangeDetailUpdateUri(params) {
  return request.post(abstractChangeDetailUpdate, {
    body: params,
  });
}
//  流程中的修改按钮   根据项目id查询相对应的预算
export async function changeBudgetByProjIdUri(projId) {
  return request.get(toUrl(changeBudgetByProjId, projId));
}
//  变更预算按钮   根据项目id查询相对应的预算
export async function createChangeBudgetByProjIdUri(projId) {
  return request.get(toUrl(createChangeBudgetByProjId, projId));
}
// 变更预算点击保存创建流程
export async function changeBudgetSaveUri(params) {
  return request.put(changeBudgetSave, {
    body: params,
  });
}
// 变更预算历史列表
export async function ChangeBudgetHistoryListUri(documentId) {
  return request.get(toQs(ChangeBudgetHistoryList, { documentId }));
}

// 项目当量交易记录
export async function findLedgerIoByProj(params) {
  return request.get(toQs(toUrl(ledgerIoByProj, { projId: params.projId }), params));
}

// 项目账户
export async function findProjLedger(params) {
  return request.get(toUrl(projectLedger, { projId: params.projId }));
}

// 项目账户 - 台账
export async function findProjLedgerIo(params) {
  return request.get(toQs(toUrl(projectLedgerIo, { projId: params.projId }), params));
}

export async function queryProjectInfo(reasonId) {
  return request.get(toUrl(projectExpenseInfo, { reasonId }));
}

export async function queryProjectList(params) {
  return request.get(toQs(projectExpenseList, params));
}

export async function queryProjectProfitReport() {
  return request.get(projectProfitReport);
}

export async function queryProjExecutionInfo() {
  return request.get(projExecutionInfo);
}

/* 项目执行情况表 */
export async function queryProjDaysEqvaMonthly() {
  return request.get(projDaysEqvaMonthly);
}
export async function queryProjReim() {
  return request.get(projReim);
}
export async function queryProjDaysEqvaDaily() {
  return request.get(projDaysEqvaDaily);
}
export async function queryProjReimDetail() {
  return request.get(projReimDetail);
}
export async function queryProjTimeSheetDetail() {
  return request.get(projTimeSheetDetail);
}
export async function queryProjPurchaseContractDetail() {
  return request.get(projPurchaseContractDetail);
}
//

export async function queryReportApi() {
  return request.get(getReportApi);
}

export async function queryReportAjax() {
  return request.get(getReportAjax);
}
export async function getBriefInfo(projId) {
  return request.get(toUrl(briefInfo, projId));
}

export async function createBriefInfo(param) {
  return request.post(toQs(briefInfoCreate, param));
}

export async function modifyBriefInfo(param) {
  return request.put(toQs(briefInfoModify, param));
}

export async function queryBriefInfoListPaging(param) {
  return request.get(toQs(briefInfoListPaging, param));
}

export async function logicalDeleteBriefInfo(param) {
  return request.patch(toQs(briefInfoLogicalDelete, param));
}

export async function queryBriefInfoLogicalDetail(param) {
  return request.get(toUrl(briefInfoLogicalDetail, param));
}

export async function procStartBriefInfo(param) {
  return request.get(toUrl(briefInfoProcStart, param));
}

export async function projectLaborUploadHandle(param) {
  return request.post(projectLaborUpload, { body: param });
}

// 收益分配
// 根据收款计划获取初始分配信息
export async function getDistInfoByBriefId(briefId) {
  return request.get(toUrl(distInfoProject, { briefId }));
}

// 保存分配信息
export async function saveDistInfo(params) {
  return request.post(distInfoProjectSave, {
    body: params,
  });
}

// 项目模板
export async function queryProjectTemplateListPaging(param) {
  return request.get(toQs(projectTemplateListPaging, param));
}
export async function logicalDeleteprojectTemplate(param) {
  return request.patch(toUrl(projectTemplateLogicalDelete, param));
}

export async function toggleEnabledProjectTemplate(param) {
  return request.put(toQs(projectTemplateToggleEnabled, param));
}

export async function createProjectTemplate(param) {
  return request.post(projectTemplateCreate, { body: param });
}

export async function modifyProjectTemplate(param) {
  return request.put(projectTemplateModify, { body: param });
}

export async function queryProjectTemplate(param) {
  return request.get(toUrl(projectTemplateDetail, param));
}

// 阶段结算单
export async function phaseSettleListFindTimeSheet(param) {
  return request.get(toQs(phaseSettleListFindTimeSheetUri, param));
}

export async function phaseSettleListCreate(param) {
  return request.post(phaseSettleListCreateUri, { body: param });
}

export async function phaseSettleListModify(param) {
  return request.post(phaseSettleListModifyUri, { body: param });
}

export async function phaseSettleListListPaging(param) {
  return request.get(toQs(phaseSettleListListPagingUri, param));
}

export async function phaseSettleListDetail(param) {
  return request.get(toUrl(phaseSettleListDetailUri, param));
}

// ===============项目结项流程================
// 结项申请保存、修改、起流程、推流程
export async function projClosureApplySaveRq(params) {
  return request.put(projClosureApplySave, { body: params });
}

// 结项申请列表
export async function projClosureApplyListRq(params) {
  return request.get(toQs(projClosureApplyList, params));
}

// 结项申请详情
export async function projClosureApplyDetailsRq(params) {
  return request.get(toUrl(projClosureApplyDetails, params));
}

// 结项申请删除
export async function projClosureApplyDeleteRq(params) {
  return request.patch(toUrl(projClosureApplyDelete, params));
}

// 项目下拉(仅项目经理看自己的项目)
export async function pmProjectRq(params) {
  return request.get(toUrl(pmProject, params));
}

// 根据项目id获取 项目结项流程检查事项及结果
export async function getResultsByProjRq(params) {
  return request.get(toUrl(getResultsByProj, params));
}

// 拉取项目结项流程检查事项及结果
export async function checkresultRq(params) {
  const { id, chkClass } = params;
  return request.get(toQs(toUrl(checkresult, { id }), { chkClass }));
}

// 检查结果的保存
export async function checkresultSaveRq(params) {
  return request.post(checkresultSave, { body: params });
}

// 获取项目成员评价信息
export async function evalInfoRq(params) {
  return request.get(toUrl(evalInfo, params));
}

// 保存评价信息
export async function evalSaveRq(params) {
  return request.post(evalSave, { body: params });
}

// 销售、领导对项目经理评价信息获取评价点信息
export async function getPointRq(params) {
  return request.get(toQs(getPoint, params));
}

// 项目成员下拉
export async function selectProjRes(projId) {
  return request.get(toUrl(projResSelect, { projId }));
}

// 查询加班列表
export async function queryAllExtrwork(params) {
  return request.get(toQs(getAllExtrwork, params));
}

// 查询加班详情
export async function queryExtrworkDetail(id) {
  return request.get(toUrl(getExtrworkDetail, { id }));
}

// 保存修改加班
export async function saveExtrwork(params) {
  return request.put(extrworkSave, {
    body: params,
  });
}

// 删除加班
export async function delExtrwork(ids) {
  return request.delete(toUrl(extrworkDel, { ids }));
}

// 我的加班
export async function queryMyExtrwork(params) {
  return request.get(toQs(myExtrwork, params));
}
// 获取加班列表
export async function queryExtrworkByResId(params) {
  return request.get(toQs(ExtrworkByResId, params));
}

// 查询资源加班是否有调休
export async function extrworkCheckHandle(id) {
  return request.get(toUrl(extrworkCheck, { id }));
}

export async function addVacationHandle(params) {
  return request.post(addVacation, {
    body: params,
  });
}

export async function recentworkExtrwork(id) {
  return request.get(toUrl(extrworkRecentwork, { id }));
}

export async function vacationExtrwork(date) {
  return request.get(toUrl(extrworkVacation, date));
}

export async function canEditExtrwork(id) {
  return request.get(toUrl(extrworkCanEdit, { id }));
}

// 项目劳务成本
export async function projectLaborCreate(param) {
  return request.post(projectLaborCreateUri, { body: param });
}
export async function projectLaborModify(param) {
  return request.put(projectLaborModifyUri, { body: param });
}
export async function projectLaborDetail(param) {
  return request.get(toUrl(projectLaborDetailUri, param));
}
export async function projectLaborListPaging(param) {
  return request.get(toQs(projectLaborListPagingUri, param));
}
export async function projectLaborLogicalDelete(param) {
  return request.patch(toQs(projectLaborLogicalDeleteUri, param));
}

// ===============无合同项目===============

// 无合同项目列表
export async function noContractListRq(params) {
  return request.get(toQs(noContractList, params));
}

// 无合同项目详情
export async function noContractDetailRq(param) {
  return request.get(toUrl(noContractDetail, param));
}

// 无合同项目流程发起和审批
export async function noContractFlowRq(param) {
  return request.post(noContractFlow, {
    body: param,
  });
}
// 预算拨付
export async function budgetAppropriationCreate(param) {
  return request.post(budgetAppropriationCreateUri, { body: param });
}
export async function budgetAppropriationModify(param) {
  return request.put(budgetAppropriationModifyUri, { body: param });
}
export async function budgetAppropriationDetail(param) {
  return request.get(toUrl(budgetAppropriationDetailUri, param));
}
export async function budgetAppropriationListPaging(param) {
  return request.get(toQs(budgetAppropriationListPagingUri, param));
}
export async function budgetAppropriationLogicalDelete(param) {
  return request.patch(toQs(budgetAppropriationLogicalDeleteUri, param));
}
export async function budgetCompare(param) {
  return request.get(toUrl(budgetCompareUri, param));
}

// 项目立项流程
// 项目立项列表
export async function setUpProjectListUriRq(params) {
  return request.get(toQs(setUpProjectListUri, params));
}
// 项目立项申请
export async function setUpProjectCreateUriRq(params) {
  return request.post(setUpProjectCreateUri, {
    body: params,
  });
}
// 项目立项申请详情
export async function setUpProjectCreateDetailRq(id) {
  return request.get(toUrl(setUpProjectCreateDetail, id));
}
// BU负责人项目立项申请详情
export async function setUpProjectBUDetailUriRq(id) {
  return request.get(toUrl(setUpProjectBUDetailUri, id));
}
// 项目立项申请 BU负责人提交
export async function setUpProjectBUCreateUriRq(params) {
  return request.post(setUpProjectBUCreateUri, {
    body: params,
  });
}
// 根据选择的交付bu查询相关子合同下拉
export async function contractSourceUriRq(params) {
  return request.get(toQs(contractSourceUri, params));
}
// 根据选择的相关子合同查询详情
export async function contractSourceDetailUriRq(id) {
  return request.get(toUrl(contractSourceDetailUri, id));
}
// 项目立项申请 销售负责人提交
export async function setUpProjectSalesManCreateUriRq(params) {
  return request.post(setUpProjectSalesManCreateUri, {
    body: params,
  });
}
// 项目立项申请 pmo提交
export async function setUpProjectPmoCreateUriRq(params) {
  return request.post(setUpProjectPmoCreateUri, {
    body: params,
  });
}
// 项目立项申请 项目经理提交
export async function setUpProjectProjManagerCreateUriRq(params) {
  return request.post(setUpProjectProjManagerCreateUri, {
    body: params,
  });
}
// 项目立项列表删除
export async function setUpProjectListDeleteUriRq(payload) {
  return request.patch(toUrl(setUpProjectListDeleteUri, payload));
}
