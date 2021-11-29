import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  ress,
  res,
  resList,
  resEqva,
  resBasicByStatusUpdate,
  resPlatByStatusUpdate,
  centerResUpdate,
  resDel,
  resBlack,
  resWhite,
  resEdubgs,
  resEdubg,
  resEdubgDel,
  resWorkbgs,
  resWorkbg,
  resWorkbgDel,
  resCerts,
  resCert,
  resCertDel,
  ousSelect,
  resCapas,
  resCapasets,
  resCapaDel,
  resGetrps,
  resGetrp,
  resGetrpDel,
  buResDetail,
  buResRole,
  buResExamList,
  resProjlogs,
  resSubmit,
  resProExp,
  resProExpSave,
  resProExpDel,
  resEnrollInfo,
  resEnrollSubmit,
  resEnrollFlow,
  resEnrollCreateInfo,
  resEnrollCreate,
  resEnrollDelete,
  resEnrollGetCreateInfo,
  resSyncELP,
  NoSubmitList,
  offerAndRes,
  notSubmitList,
  listOfferEntry,
  getOfferAndResDetails,
  salesBu,
  getOldSaleBu,
  entryItemList,
  itAdmin,
  findBu,
  checkResult,
  changeStatue,
  leavelApplyList,
  resDetail,
  leavelDetail,
  saveEntity,
  myVacationList,
  checkresultList,
  hrcheckList,
  initLeaveChecks,
  resLeaveUpdate,
  checkresultUpdate,
  eval: { avg },
  checkItemResultList,
  resMessageUpdate,
  resTemporaryDetails,
  findCapa,
  findJobIsUsed,
  closeFlowForTask6,
  saveEntityAbility,
  resHrLabel,
  HrLabel,
  resApplyList,
  extrApplyCreate,
  getResApplyListDetails,
  checkExtrApplyAbAcc,
  saveSelfEvaluation,
  getSelfEvaluation,
  resPortrayal,
  resPortrayalCapacity,
  resPortrayalCertificate,
  resPortrayalWork,
  resPortrayalEvaluationAll,
  resPortrayalEvaluationGood,
  resPortrayalEvaluationMiddle,
  resPortrayalEvaluationBad,
  resPortrayalEvaluationNew,
  resPortrayalProject,
  resPortrayalTask,
  pronationList,
  pronationDetail,
  changeBaseSubmit,
  changeBaseDetail,
  entryExitList, // 入离职记录
  resAbility, // 资源单项能力和复核能力
  offerEntryMyCapaset, // 拉取复合能力
} = api.plat;

// =====资源start========
export async function findResList(params) {
  return request.get(toQs(ress, params));
}

export async function findResById(id) {
  return request.get(toUrl(res, { id }));
}

export async function findResListById(id) {
  return request.get(toUrl(resList, { id }));
}

export async function findResEqva(params) {
  return request.get(toQs(resEqva, params));
}

export async function deleteResList(ids) {
  return request.patch(toUrl(resDel, { ids: ids.join(',') }));
}

export async function addResBlackList(ids) {
  return request.patch(toUrl(resBlack, { ids: ids.join(',') }));
}

export async function addResWhiteList(ids) {
  return request.patch(toUrl(resWhite, { ids: ids.join(',') }));
}

export async function create(params) {
  return request.post(ress, {
    body: params,
  });
}

export async function update(params) {
  return request.put(toUrl(resBasicByStatusUpdate, { id: params.id }), {
    body: params,
  });
}

// 提交个人信息修改申请
export async function resMessageUpdateRq(params) {
  return request.post(resMessageUpdate, {
    body: params,
  });
}

// 个人信息修改流程详情
export async function resTemporaryDetailsRq(params) {
  return request.get(toUrl(resTemporaryDetails, params));
}

export async function updatePlatByStatus(params) {
  return request.put(toUrl(resPlatByStatusUpdate, { id: params.id }), {
    body: params,
  });
}

export async function submitRes(params) {
  return request.put(toUrl(resSubmit, { resId: params.resId }), {
    body: params,
  });
}

// 个人中心-个人基本信息修改保存
export async function updateCenter(params) {
  return request.put(toUrl(centerResUpdate, { id: params.id }), {
    body: params,
  });
}

// =====资源教育经历start========
export async function findResEdubgList(params) {
  return request.get(toQs(resEdubgs, params));
}

export async function edubgCreate(params) {
  return request.post(resEdubgs, {
    body: params,
  });
}

export async function edubgUpdate(params) {
  return request.put(toUrl(resEdubg, { id: params.id }), {
    body: params,
  });
}

export async function deleteResEdubgs(ids) {
  return request.patch(toUrl(resEdubgDel, { ids: ids.join(',') }));
}

// =====资源工作经历start========
export async function findResWorkbgList(params) {
  return request.get(toQs(resWorkbgs, params));
}

export async function workbgCreate(params) {
  return request.post(resWorkbgs, {
    body: params,
  });
}

export async function workbgUpdate(params) {
  return request.put(toUrl(resWorkbg, { id: params.id }), {
    body: params,
  });
}

export async function deleteResWorkbgs(ids) {
  return request.patch(toUrl(resWorkbgDel, { ids: ids.join(',') }));
}

// =====资源资质证书start========
export async function findResCertList(params) {
  return request.get(toQs(resCerts, params));
}

export async function certCreate(params) {
  return request.post(resCerts, {
    body: params,
  });
}

export async function certUpdate(params) {
  return request.put(toUrl(resCert, { id: params.id }), {
    body: params,
  });
}

export async function deleteResCerts(ids) {
  return request.patch(toUrl(resCertDel, { ids: ids.join(',') }));
}

// 公司下拉数据
export async function selectOus(params) {
  return request.get(toQs(ousSelect, params));
}

// ==============资源能力==================

export async function findResCapaList(params) {
  return request.get(toQs(resCapas, params));
}

export async function findResCapasetList(params) {
  return request.get(toQs(resCapasets, params));
}

// ===============奖惩信息===================
export async function findResGetrpList(params) {
  return request.get(toQs(resGetrps, params));
}

export async function getrpCreate(params) {
  return request.post(resGetrps, {
    body: params,
  });
}

export async function getrpUpdate(params) {
  return request.put(toUrl(resGetrp, { id: params.id }), {
    body: params,
  });
}

export async function deleteGetrps(ids) {
  return request.patch(toUrl(resGetrpDel, { ids: ids.join(',') }));
}

// ===============组织信息 BU资源================
export async function findBuResByResId(resId) {
  return request.get(toUrl(buResDetail, { resId }));
}

export async function findBuResRole(resId) {
  return request.get(toUrl(buResRole, resId));
}

export async function findBuResExamList(resId) {
  return request.get(toUrl(buResExamList, resId));
}

// ==============资源评价信息=====================
export async function findResEvalAvg(resId) {
  return request.get(toUrl(avg, resId));
}

// ==============资源项目履历=====================
export async function findResProjlogsList(resId) {
  return request.get(toUrl(resProjlogs, resId));
}

// ===========资源项目履历=============
export async function findResProExp(params) {
  return request.get(toQs(resProExp, params));
}

export async function saveResProExp(params) {
  return request.put(resProExpSave, {
    body: params,
  });
}

export async function deleteResProExp(ids) {
  return request.patch(toUrl(resProExpDel, { ids: ids.join(',') }));
}

// ===========资源入职=============
export async function queryResEnrollInfo(resId) {
  return request.get(toUrl(resEnrollInfo, resId));
}

export async function submitResEnroll(params) {
  return request.post(resEnrollSubmit, {
    body: params,
  });
}

export async function flowResEnroll(id) {
  return request.post(toUrl(resEnrollFlow, { id }));
}

export async function queryResEnrollCreateInfo(resId) {
  return request.get(toUrl(resEnrollCreateInfo, resId));
}

export async function createResEnroll(params) {
  return request.post(resEnrollCreate, {
    body: params,
  });
}

export async function delResEnroll(resId) {
  return request.post(toUrl(resEnrollDelete, resId));
}

export async function getCreateInfo(resId) {
  return request.get(toUrl(resEnrollGetCreateInfo, resId));
}

export async function sync2ELP(resId) {
  return request.post(toUrl(resSyncELP, { resId }));
}

export async function getNoSubmitList() {
  return request.get(NoSubmitList);
}

// ===========Offer及资源入职=============
// 入职流程列表
export async function listOfferEntryRq(params) {
  return request.get(toQs(listOfferEntry, params));
}

export async function offerAndResRq(params) {
  return request.put(offerAndRes, {
    body: params,
  });
}

// 未提交资源列表
export async function notSubmitListRq() {
  return request.get(notSubmitList);
}

// 获取入职流程详情
export async function getOfferAndResDetailsRq(resId) {
  return request.get(toUrl(getOfferAndResDetails, resId));
}

// 独立BU
export async function salesBuRq(params) {
  return request.get(salesBu);
}

// 获取原销售BU
export async function getOldSaleBuRq(resId) {
  return request.get(toUrl(getOldSaleBu, resId));
}

// 入职事项办理
export async function entryItemListRq(twofferId) {
  return request.get(toUrl(entryItemList, twofferId));
}

// 开通IT账号
export async function itAdminRq(params) {
  return request.put(toUrl(itAdmin, { procTaskId: params.procTaskId }), {
    body: params,
  });
}

// 查找BU是否存在
export async function findBuRq(buId) {
  return request.get(toUrl(findBu, buId));
}

// 标记入职选择项
export async function checkResultRq(params) {
  return request.put(checkResult, {
    body: params,
  });
}

// 标记入职事项状态
export async function changeStatueRq(params) {
  return request.put(toUrl(changeStatue, { id: params.id }), {
    body: params,
  });
}

// 获取入职检查事项
export async function checkItemResultListRq(params) {
  const { id, chkClass } = params;
  return request.get(toQs(toUrl(checkItemResultList, { leavId: id }), { chkClass }));
}

// 查找复合能力是否添加
export async function findCapaRq(params) {
  return request.get(toUrl(findCapa, params));
}

// 拉取被筛选的简历
export async function findJobIsUsedRq() {
  return request.get(findJobIsUsed);
}

// 入职信息录入节点关闭流程A30-06
export async function closeFlowForTask6Rq(params) {
  return request.delete(closeFlowForTask6, {
    body: params,
  });
}

// 入职信息直属领导审批A30_11
export async function saveEntityAbilityRq(params) {
  return request.post(saveEntityAbility, {
    body: params,
  });
}

// ==================Base地变更流程================
// 提交base地变更申请
export async function changeBaseSubmitRq(params) {
  return request.post(changeBaseSubmit, {
    body: params,
  });
}
// base地变更流程审批详情
export async function changeBaseDetailRq(params) {
  return request.get(toUrl(changeBaseDetail, params));
}

// ==================离职流程================
// 离职流程列表
export async function leavelApplyListRq(params) {
  return request.get(toQs(leavelApplyList, params));
}

// 资源详情
export async function resDetailRq(resId) {
  return request.get(toUrl(resDetail, { resId }));
}

// 离职资源详情
export async function leavelDetailRq(id) {
  return request.get(toUrl(leavelDetail, { id }));
}

// 保存离职信息
export async function saveEntityRq(params) {
  return request.put(saveEntity, {
    body: params,
  });
}

// 离职资源的剩余假期
export async function myVacationListRq(id) {
  return request.get(toQs(myVacationList, id));
}

// 获取离职检查事项
export async function checkresultListRq(id) {
  return request.get(toUrl(checkresultList, { id }));
}

// 获取第八节点(离职办理-总部人事专员)离职检查事项(根据解除劳动合同日期生成)
export async function hrcheckListRq(params) {
  return request.get(toUrl(hrcheckList, params));
}

// 资源列表 保存离职信息
export async function initLeaveChecksRq(params) {
  return request.post(toUrl(initLeaveChecks, params));
}

// 资源列表 离职确认（继续）
export async function resLeaveUpdateRq(params) {
  return request.patch(toUrl(resLeaveUpdate, params));
}

// 更改离职检查事项状态、备注等信息
export async function checkresultUpdateRq(params) {
  return request.put(checkresultUpdate, {
    body: params,
  });
}

// 获取人事标签
export async function getResHrLabel(id) {
  return request.get(toUrl(resHrLabel, { id }));
}

// 保存人事标签
export async function saveResHrLabel(params) {
  return request.post(HrLabel, {
    body: params,
  });
}

// 提交外部资源
export async function saveResApplyList(params) {
  return request.post(extrApplyCreate, {
    body: params,
  });
}

// 外部资源流程详情
export async function getResApplyListRq(params) {
  return request.get(toUrl(getResApplyListDetails, params));
}

// 外部资源 检查财务信息
export async function checkExtrApplyAbAccRq(params) {
  return request.post(checkExtrApplyAbAcc, {
    body: params,
  });
}

// 获取资源自我评价
export async function getSelfEvaluationFn(id) {
  return request.get(toUrl(getSelfEvaluation, { id }));
}

// 更新自我评价
export async function saveSelfEvaluationFn(params) {
  return request.patch(saveSelfEvaluation, {
    body: params,
  });
}

// 资源画像 基本信息
export async function resPortrayalRq(params) {
  return request.get(toUrl(resPortrayal, params));
}

// 资源画像 能力
export async function resPortrayalCapacityRq(params) {
  return request.get(toUrl(resPortrayalCapacity, params));
}

// 资源画像 资格证书
export async function resPortrayalCertificateRq(id, params) {
  return request.get(toQs(toUrl(resPortrayalCertificate, id), params));
}

// 资源画像 工作经历
export async function resPortrayalWorkRq(id, params) {
  return request.get(toQs(toUrl(resPortrayalWork, id), params));
}

// 资源画像 评价-全部
export async function resPortrayalEvaluationAllRq(id, params) {
  return request.get(toQs(toUrl(resPortrayalEvaluationAll, id), params));
}

// 资源画像 评价-好评
export async function resPortrayalEvaluationGoodRq(id, params) {
  return request.get(toQs(toUrl(resPortrayalEvaluationGood, id), params));
}

// 资源画像 评价-中评
export async function resPortrayalEvaluationMiddleRq(id, params) {
  return request.get(toQs(toUrl(resPortrayalEvaluationMiddle, id), params));
}

// 资源画像 评价-差评
export async function resPortrayalEvaluationBadRq(id, params) {
  return request.get(toQs(toUrl(resPortrayalEvaluationBad, id), params));
}

// 资源画像 评价-最新
export async function resPortrayalEvaluationNewRq(id, params) {
  return request.get(toQs(toUrl(resPortrayalEvaluationNew, id), params));
}

// 资源画像 项目经验
export async function resPortrayalProjectRq(id, params) {
  return request.get(toQs(toUrl(resPortrayalProject, id), params));
}

// 资源画像 任务履历
export async function resPortrayalTaskRq(id, params) {
  return request.get(toQs(toUrl(resPortrayalTask, id), params));
}

// 试用期转正
export async function pronationListRq(params) {
  return request.get(toQs(pronationList, params));
}

// 试用期转正详情
export async function pronationDetailRq(id) {
  return request.get(toUrl(pronationDetail, { id }));
}

// 入离职记录
export async function findEntryExitList(resId) {
  return request.get(toUrl(entryExitList, resId));
}

// 入职流程直属领导审批节点拉取资源单项能力和符合能力
export async function resAbilityRq(payload) {
  return request.get(toUrl(resAbility, payload));
}

// 拉取复合能力
export async function offerEntryMyCapasetRq() {
  return request.get(offerEntryMyCapaset);
}
