import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  weeklyReport: {
    workPlanList,
    workPlanCreate,
    workPlanDetails,
    workPlanUpdate,
    workPlanDelete,
    workPlanChangeStatus,
    taskAll,
    activity,
    workReportFindByDate,
    workReportCreate,
    getWorkPlan,
    getPResInfo,
    weeklyReportList,
    weeklyReportDetail,
    workCalendar,
    updateWorkStatus,
    myWeeklyReportList,
    workLogSaveUri,
    queryStartTimeUri,
    workPlanSelectUri,
    workReportSaveUri,
    workReportsUri,
    delWorkReportsUri,
    workReportsDetailUri,
    MyReportCheckListUri,
    workPlanChntList,
    workPlanChntCreate,
    workPlanChntDetails,
    workPlanChntDelete,
    workPlanChntUpdate,
    workPlanChntFinish,
    workPlanChangePoint,
    objectiveAll,
    myWorkReportUri,
    workLogsQueryUri,
  },
} = api.user;

// ===========================工作计划===========================
// 工作计划列表
export async function workPlanListRq(params) {
  return request.get(toQs(workPlanList, params));
}

// 新增工作计划
export async function workPlanCreateRq(params) {
  return request.post(workPlanCreate, {
    body: params,
  });
}

// 工作计划详情
export async function workPlanDetailsRq(id) {
  return request.get(toUrl(workPlanDetails, id));
}

// 修改工作计划
export async function workPlanUpdateRq(params) {
  return request.put(workPlanUpdate, {
    body: params,
  });
}

// 工作计划删除
export async function workPlanDeleteRq(payload) {
  return request.patch(toUrl(workPlanDelete, payload));
}

// 工作计划状态更改
export async function workPlanChangeStatusRq(parmars) {
  return request.patch(toUrl(workPlanChangeStatus, parmars));
}

// 任务包下拉
export async function taskAllRq(id) {
  return request.get(toUrl(taskAll, id));
}

// 活动下拉
export async function activityRq(taskId) {
  return request.get(toUrl(activity, taskId));
}

// ===========================工作计划-正泰===========================
// 工作计划-正泰列表
export async function workPlanChntListRq(params) {
  return request.get(toQs(workPlanChntList, params));
}

// 工作计划-正泰新增
export async function workPlanChntCreateRq(params) {
  return request.post(workPlanChntCreate, {
    body: params,
  });
}

// 工作计划-正泰详情
export async function workPlanChntDetailsRq(id) {
  return request.get(toUrl(workPlanChntDetails, id));
}

// 工作计划-正泰删除
export async function workPlanChntDeleteRq(payload) {
  return request.patch(toUrl(workPlanChntDelete, payload));
}

// 修改工作计划-正泰
export async function workPlanChntUpdateRq(params) {
  return request.put(workPlanChntUpdate, {
    body: params,
  });
}

// 工作计划-正泰 结束
export async function workPlanChntFinishRq(payload) {
  return request.put(toUrl(workPlanChntFinish, payload));
}

// 工作计划-正泰 目标下拉
export async function objectiveAllRq(id) {
  return request.get(toUrl(objectiveAll, id));
}

// 工作计划-正泰重点关注更改
export async function workPlanChangePointRq(parmars) {
  return request.patch(toUrl(workPlanChangePoint, parmars));
}

// ===========================周报填写===========================
// 保存周报
export async function workReportCreateRq(params) {
  return request.post(workReportCreate, {
    body: params,
  });
}

// 获取周报填写详情
export async function workReportFindByDateRq(params) {
  return request.get(toUrl(workReportFindByDate, params));
}

// 导入工作计划
export async function getWorkPlanRq(params) {
  return request.get(toUrl(getWorkPlan, params));
}

// 获取上级领导信息
export async function getPResInfoRq(params) {
  return request.get(toQs(getPResInfo, params));
}

// ==========================我的周报==========================
// 我的周报列表
export async function myWeeklyReportListRq(params) {
  return request.get(toQs(myWeeklyReportList, params));
}

// ==========================周报查看==========================
// 周报列表
export async function weeklyReportListRq(params) {
  return request.get(toQs(weeklyReportList, params));
}

// 周报详情
export async function weeklyReportDetailRq(params) {
  return request.get(toUrl(weeklyReportDetail, params));
}

// 工作日历
export async function workCalendarInfo(params) {
  return request.get(toQs(workCalendar, params));
}

// 工作状态更新
export async function updateWorkStatusApi(params) {
  return request.patch(toUrl(updateWorkStatus, params));
}
// 日志保存
export async function saveWorkLog(params) {
  // console.log("params",params);
  // eslint-disable-next-line no-param-reassign
  params.entityList = params.dataSource;
  // eslint-disable-next-line no-param-reassign
  delete params.dataSource;
  return request.post(workLogSaveUri, { body: params });
}
// 工作日志查询
export async function queryStartTime(params) {
  return request.get(toQs(queryStartTimeUri, params));
}
// 工作计划下拉
export async function workPlanSelect(params) {
  return request.get(toQs(workPlanSelectUri, params));
}
// 工作日志汇报保存
export async function workReportSave(params) {
  return request.post(workReportSaveUri, { body: params });
}

// 我的报告查询
export async function myReportListRq(params) {
  return request.get(toQs(workReportsUri, params));
}

// 报告批量删除
export async function delWorkReports(ids) {
  return request.patch(toUrl(delWorkReportsUri, { ids: ids.join(',') }));
}
// 报告详情
export async function workReportDetail(params) {
  return request.get(toQs(workReportsDetailUri, params));
}
// 报告查看
export async function MyReportCheckListRq(params) {
  return request.get(toQs(MyReportCheckListUri, params));
}
// 我的报告汇报
export async function myWorkReport(reportId) {
  return request.put(toUrl(myWorkReportUri, { id: reportId }));
}
// 工作日志查询
export async function workLogsQuery(params) {
  return request.get(toQs(workLogsQueryUri, params));
}
