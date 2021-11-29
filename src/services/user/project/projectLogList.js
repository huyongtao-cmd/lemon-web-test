import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { project } = api.user;
const {
  projectLogList,
  doDeleteProjectLogs,
  doCreateProjectLog,
  doGetProjectLogById,
  doGetQuestionInfoById,
  doGetProjectChangeLogList,
  doGetProjectRecordList,
  doCreateProjectLogHistory,
  doCreateProjectLogApproval,
  doGetProjectApprovalById,
  doCreateProjectRecordHistory,
  doGetProjectLogByDemandId,
  doProjectLogUploadRq,
  doProjectLogApproved,
  projProList,
} = project;
const { userMultiColSelect, projectMultiColSelect } = api.user;

const { passAndReturn } = api.flowHandle;

// 资源编号
export async function selectUsers(params) {
  return request.get(toUrl(userMultiColSelect, { params }));
}
// 项目编号
export async function selectProject(params) {
  return request.get(toUrl(projectMultiColSelect, { params }));
}

// 获取项目日志列表
export async function getProjectLogList(params) {
  return request.get(toQs(projectLogList, params));
}
// 删除项目日志
export async function deleteProjectLogs(data) {
  return request.patch(toUrl(doDeleteProjectLogs, data));
}
// 新增项目日志
export async function createProjectLog(data) {
  return request.post(doCreateProjectLog, {
    body: data,
  });
}
// 根据id获取项目日志
export async function getProjectLogById(id) {
  return request.get(toUrl(doGetProjectLogById, { id }));
}
// 根据问题反馈ID查找详情
export async function getQuestionInfoById(id) {
  return request.get(toUrl(doGetQuestionInfoById, { id }));
}

// 根据项目日志ID查找历史修改记录信息
export async function getProjectChangeLogList(params) {
  return request.get(toQs(doGetProjectChangeLogList, params));
}

// 根据项目日志ID查找跟踪日志记录信息
export async function getProjectRecordList(changeId) {
  return request.get(toQs(doGetProjectRecordList, { changeId }));
}

// 新增项目日志历史记录
export async function createProjectLogHistory(data) {
  return request.post(doCreateProjectLogHistory, {
    body: data,
  });
}

// 新增项目日志跟踪日志
export async function createProjectRecordHistory(data) {
  return request.post(doCreateProjectRecordHistory, {
    body: data,
  });
}

// 新增项目日志审批
export async function createProjectLogApproval(data) {
  return request.post(doCreateProjectLogApproval, {
    body: data,
  });
}

// 查询属于自己的项目列表
export async function queryProjList(params) {
  return request.get(projProList);
}

// 根据项目日志ID查找审批信息，项目日志详情页专用
export async function getProjectApprovalById(projectId) {
  return request.get(toQs(doGetProjectApprovalById, { projectId }));
}

// 根据审批ID查找项目日志信息,审批详情页专用
export async function getProjectLogByDemandId(id) {
  return request.get(toUrl(doGetProjectLogByDemandId, { id }));
}
// 根据审批ID查找审批信息,审批详情页专用
export async function getProjectApprovalDetailsById(id) {
  return request.get(toQs(doGetProjectApprovalById, { id }));
}
// 根据审批ID查找历史修改记录信息,审批详情页专用
export async function findProjectChangeLogLists(params) {
  return request.get(toQs(doGetProjectChangeLogList, params));
}
// 根据审批ID查找跟踪日志记录信息,审批详情页专用
export async function getProjectRecordLists(demandId) {
  return request.get(toQs(doGetProjectRecordList, { demandId }));
}
// 导入excel潜在客户数据
export async function projectLogUploadRq(params) {
  return request.post(doProjectLogUploadRq, {
    body: params,
  });
}

// 发起审批
export async function projectLogSubmit(params) {
  const { taskId, result, remark } = params;
  return request.post(toUrl(passAndReturn, { id: taskId }), {
    body: {
      remark,
      result,
    },
  });
}

// 审批通过
export async function projectLogApproved(taskId, params) {
  const { remark, branch, result } = params;
  return request.post(toUrl(passAndReturn, { id: taskId }), {
    body: {
      remark,
      result,
      branch,
    },
  });
}

// 审批拒绝
export async function doReject(taskId, params) {
  const { remark, branch, result } = params;
  return request.post(toUrl(passAndReturn, { id: taskId }), {
    body: {
      remark,
      result,
      branch,
    },
  });
}
