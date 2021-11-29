import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  timesheets,
  myTimesheets,
  lastweekTimesheets,
  timesheetSave,
  timesheetDel,
  projList,
  selectTask,
  selectActivity,
  timesheetAsWeek,
  timesheetsDetail,
  approvedTimesheet,
  canceledTimesheet,
  rejectedTimesheet,
  revokedTimesheet,
  jdeTimesheetReport,
  timesheetAdminApproval,
} = api.user.timesheet;
const { userMultiColSelect, buMultiColSelect, projectMultiColSelect } = api.user;
const { extrworkFlag } = api.user.project;

// 项目
export async function queryReasonList() {
  return request.get(projectMultiColSelect);
}

// 查询工时列表
export async function queryTimeSheets(params) {
  return request.get(toQs(timesheets, params));
}

// 工时高级审批
export async function timesheetAdminApprovalRq(ids) {
  return request.patch(toUrl(timesheetAdminApproval, ids));
}

// 查询按周工时列表
export async function queryTimeSheetsAsWeek(params) {
  return request.get(toQs(timesheetAsWeek, params));
}

// 查询明细工时列表
export async function queryTimeSheetsDetail(params) {
  return request.get(toQs(timesheetsDetail, params));
}
// 查询我的工时列表
export async function queryWeekStart(params) {
  return request.get(toQs(myTimesheets, params));
}

// 查询上周数据
export async function queryLastWeek(params) {
  return request.get(toUrl(lastweekTimesheets, { weekStart: params.weekStartDate }));
}

// 批量保存工时
export async function saveTimesheets(params) {
  return request.post(timesheetSave, { body: params });
}

// 批量删除工时
export async function deleteTimesheet(ids) {
  return request.patch(toUrl(timesheetDel, { ids: ids.join(',') }));
}

// 查询项目列表 resId 必填
export async function queryProjList(params) {
  return request.get(toQs(projList, params));
}

// 人员数据 下拉
export async function selectUsers(params) {
  return request.get(userMultiColSelect);
}

// 选择项目查询任务包 ID resId 必填
export async function queryTasksList(params) {
  return request.get(toQs(selectTask, params));
}

// 选择任务包查询活动 taskId 必填
export async function queryActivityList(params) {
  return request.get(toUrl(selectActivity, params));
}

// 审批工时通过 ids
export async function approvedTimesheets(params) {
  return request.post(toUrl(approvedTimesheet, params));
}

// 取消审批通过 ids
export async function canceledTimesheets(params) {
  return request.post(toQs(toUrl(canceledTimesheet, params), { confirm: params.confirm }));
}

// 审批拒绝 ids
export async function rejectedTimesheets(ids, params) {
  return request.post(toUrl(rejectedTimesheet, ids), { body: params });
}

// bu数据 下拉
export async function selectBus() {
  return request.get(buMultiColSelect);
}

// 撤回 工时 ids
export async function revokedTimesheets(params) {
  return request.post(toUrl(revokedTimesheet, params));
}

// JDE 工时 报表
export async function queryJdeTimesheetReport(params) {
  return request.get(toQs(jdeTimesheetReport, params));
}

// 查询工时列表
export async function queryExtrworkFlag(params) {
  return request.get(toQs(extrworkFlag, params));
}
