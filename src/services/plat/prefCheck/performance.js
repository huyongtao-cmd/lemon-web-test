import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  prefMgmt: {
    targetPeriodList,
    targetPeriodSave,
    targetPeriodDelete,
    targetPeriodDetail,
    targetResList,
    targetNoticedList,
    feedbackResList,
    feedbackNoticedList,
    summaryResList,
    summaryNoticedList,
    targetBatchSet,
    feedbackBatchSet,
    summaryBatchSet,
    performanceTargetList,
    performanceTargetSave,
    performanceTargetDelete,
    performanceTargetDetail,
    indexTargetSave,
    indexTargetDelete,
    indexHistory,
    getResDetail,
    getPeriodList,
    performanceFeedbackList,
    performanceFeedbackDetail,
    performanceFeedbackSave,
    feedbackCheckChanging,
    performanceSummaryList,
    performanceSummaryDetail,
    performanceSummarySave,
    stageAssesmentEvaluateSave,
    gradeBatchPublish,
  },
} = api.plat;

// ===========================KPI周期管理===========================

// KPI周期列表
export async function targetPeriodListRq(params) {
  return request.get(toQs(targetPeriodList, params));
}

// KPI周期新建|修改
export async function createTargetPeriodRq(params) {
  return request.post(targetPeriodSave, {
    body: params,
  });
}

// KPI周期删除
export async function targetPeriodDeleteRq(params) {
  return request.patch(toUrl(targetPeriodDelete, params));
}

// KPI周期详情
export async function targetPeriodDetailRq(params) {
  return request.get(toUrl(targetPeriodDetail, params));
}

// KPI周期待通知人员
export async function targetResListRq(params) {
  return request.get(toQs(targetResList, params));
}

// KPI周期已通知人员
export async function targetNoticedListRq(params) {
  return request.get(toQs(targetNoticedList, params));
}

// 批量发起kpi设置流程
export async function targetBatchSetRq(params) {
  return request.post(toUrl(targetBatchSet, { id: params.periodId }), {
    body: params.resIds,
  });
}

// 年中反馈待通知人员
export async function feedbackResListRq(params) {
  return request.get(toQs(feedbackResList, params));
}

// 年中反馈已通知人员
export async function feedbackNoticedListRq(params) {
  return request.get(toQs(feedbackNoticedList, params));
}

// 批量发起年中反馈流程
export async function feedbackBatchSetRq(params) {
  return request.post(toUrl(feedbackBatchSet, { id: params.periodId }), {
    body: params.resIds,
  });
}

// 年末报告待通知人员
export async function summaryResListRq(params) {
  return request.get(toQs(summaryResList, params));
}

// 年末报告已通知人员
export async function summaryNoticedListRq(params) {
  return request.get(toQs(summaryNoticedList, params));
}

// 批量发起年末报告流程
export async function summaryBatchSetRq(params) {
  return request.post(toUrl(summaryBatchSet, { id: params.periodId }), {
    body: params.resIds,
  });
}

// ===========================KPI目标管理===========================

// KPI目标列表
export async function performanceTargetListRq(params) {
  return request.get(toQs(performanceTargetList, params));
}

// KPI目标新建|修改
export async function createPerformanceTargetRq(params) {
  return request.post(performanceTargetSave, {
    body: params,
  });
}

// KPI目标删除
export async function performanceTargetDeleteRq(params) {
  return request.patch(toUrl(performanceTargetDelete, params));
}

// KPI目标详情
export async function performanceTargetDetailRq(params) {
  return request.get(toUrl(performanceTargetDetail, params));
}

// KPI指标新建|修改
export async function createIndexTargetSaveRq(params) {
  return request.post(indexTargetSave, {
    body: params,
  });
}

// KPI指标删除
export async function indexTargetDeleteRq(params) {
  return request.patch(toUrl(indexTargetDelete, params));
}

// 指标历史版本
export async function indexHistoryRq(params) {
  return request.get(toUrl(indexHistory, params));
}

// 根据资源获取详情
export async function getResDetailRq(params) {
  return request.get(toQs(getResDetail, params));
}

// 获取目标周期列表
export async function getPeriodListRq(params) {
  return request.get(toQs(getPeriodList, params));
}

// ===========================KPI年中反馈管理===========================

// KPI年中反馈列表
export async function performanceFeedbackListRq(params) {
  return request.get(toQs(performanceFeedbackList, params));
}

// KPI年中反馈详情
export async function performanceFeedbackDetailRq(params) {
  return request.get(toUrl(performanceFeedbackDetail, params));
}

// KPI年中反馈保存
export async function createFeedbackSaveRq(params) {
  return request.post(performanceFeedbackSave, {
    body: params,
  });
}

// 个人修改了绩效考核指标后，如果流程没有走完，该节点的审批不能放过去
export async function feedbackCheckChangingRq(params) {
  return request.get(toQs(feedbackCheckChanging, params));
}

// ===========================年末述职报告管理===========================

// 年末述职报告列表
export async function performanceSummaryListRq(params) {
  return request.get(toQs(performanceSummaryList, params));
}

// 年末述职报告详情
export async function performanceSummaryDetailRq(params) {
  return request.get(toUrl(performanceSummaryDetail, params));
}

// 年末述职报告保存
export async function createSummarySaveRq(params) {
  return request.post(performanceSummarySave, {
    body: params,
  });
}

// 评价及建议
export async function stageAssesmentEvaluateSaveRq(params) {
  return request.post(stageAssesmentEvaluateSave, {
    body: params,
  });
}

// 批量发起KPI打分公布流程
export async function gradeBatchPublishRq(params) {
  return request.post(gradeBatchPublish, {
    body: params,
  });
}
