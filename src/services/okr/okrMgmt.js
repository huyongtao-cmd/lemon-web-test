import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { launchFlow } = api.flowHandle;

const {
  okrMgmt: {
    implementList,
    implementDetail,
    implementEdit,
    implementDel,
    objectiveList,
    objectiveSupList,
    objectiveEdit,
    objectiveDetail,
    objectiveDel,
    targetMap,
    targetEvalDetail,
    targetResultUpdate,
    saveComment,
    targetResultFlowDetail,
    selectGradeList,
    targetResultSave,
    targetResultEvalPass,
    targetResultFinalEval,
    keyResultDetail,
    kRUpdate,
    keyresultUpdateDetail,
    commentInsert,
    commentSelect,
    commentSelectDetail,
    commentLike,
    userHomeBaseData,
    userHomeMyShortCut,
    userHomeObjectiveList,
    userHomeTodoTasks,
    objectiveWorkPlanList,
    objectiveWorkPlanChntDetails,
    objectiveWorkPlanChntCreate,
    objectiveWorkPlanChntUpdate,
    objectiveWorkLogSaveUri,
    objtemp,
    targetPathMap,
    isPre,
    stateStatis,
    updateStatis,
    objectiveCatUpdate,
    getOkrListByStatus,
    getOkrListByUpdate,
  },
} = api.okr;

// ===========================OKR管理===========================

// ================实施周期==================
// 实施周期列表
export async function implementListRq(params) {
  return request.get(toQs(implementList, params));
}

// 实施周期新增和修改
export async function implementEditRq(params) {
  return request.post(implementEdit, {
    body: params,
  });
}

// 实施周期关联目标详情
export async function implementDetailRq(params) {
  return request.get(toQs(implementDetail, params));
}

// 实施周期删除(可批量)
export async function implementDelRq(payload) {
  return request.patch(toUrl(implementDel, payload));
}

// ================目标==================
// 目标列表
export async function objectiveListRq(params) {
  return request.get(toQs(objectiveList, params));
}

// 目标列表
export async function objectiveSupListRq(params) {
  return request.get(toQs(objectiveSupList, params));
}

// 目标新增和修改
export async function objectiveEditRq(params) {
  return request.post(objectiveEdit, {
    body: params,
  });
}

// 新增目标的 新增和更新
export async function objtempRq(params) {
  return request.post(objtemp, {
    body: params,
  });
}

// 判断当前登录人是否是选定资源的上级
export async function isPreRq(params) {
  return request.get(toUrl(isPre, params));
}

// 目标详情
export async function objectiveDetailRq(params) {
  return request.get(toUrl(objectiveDetail, params));
}

// 目标删除(可批量)
export async function objectiveDelRq(params) {
  return request.patch(toUrl(objectiveDel, params));
}

// 目标树状图
export async function targetMapRq(params) {
  return request.get(toQs(targetMap, params));
}

// 目标进度更新详情
export async function keyResultDetailRq(params) {
  return request.get(toUrl(keyResultDetail, params));
}

// 目标进度更新保存
export async function kRUpdateRq(params) {
  return request.post(kRUpdate, {
    body: params,
  });
}

// 目标进度更新保存后调取的详情
export async function keyresultUpdateDetailRq(params) {
  return request.get(toUrl(keyresultUpdateDetail, params));
}

// ==========================OKR打分===========================
// 目标详情
export async function targetEvalDetailRq(params) {
  return request.get(toUrl(targetEvalDetail, params));
}

// 目标进度确认(下一步)
export async function targetResultUpdateRq(params) {
  return request.post(targetResultUpdate, {
    body: params,
  });
}

// 目标结果总结(上一步)
export async function saveCommentRq(params) {
  return request.post(saveComment, {
    body: params,
  });
}

// 目标打分流程详情
export async function targetResultFlowDetailRq(params) {
  return request.get(toUrl(targetResultFlowDetail, params));
}

// 目标打分流程列表
export async function selectGradeListRq(params) {
  return request.get(toQs(selectGradeList, params));
}

// 目标结果总结(提交发起流程)
export async function targetResultSaveRq(params) {
  return request.post(targetResultSave, {
    body: params,
  });
}

// 目标打分结果(通过)
export async function targetResultEvalPassRq(params) {
  return request.post(targetResultEvalPass, {
    body: params,
  });
}

// 目标最终结果确认(通过)
export async function targetResultFinalEvalRq(params) {
  return request.post(targetResultFinalEval, {
    body: params,
  });
}

// 目标详情页签-工作计划列表
export async function objectiveWorkPlanListRq(params) {
  return request.get(toQs(objectiveWorkPlanList, params));
}
// 工作计划详情
export async function objectiveWorkPlanChntDetailsRq(id) {
  return request.get(toUrl(objectiveWorkPlanChntDetails, id));
}
// 工作计划-正泰新增
export async function objectiveWorkPlanChntCreateRq(params) {
  return request.post(objectiveWorkPlanChntCreate, {
    body: params,
  });
}
// 修改工作计划-正泰
export async function objectiveWorkPlanChntUpdateRq(params) {
  return request.put(objectiveWorkPlanChntUpdate, {
    body: params,
  });
}

// 工作计划-工作日志保存
export async function objectiveWorkLogSaveUriRq(params) {
  return request.post(objectiveWorkLogSaveUri, {
    body: params,
  });
}

// ====================目标指导与评价========================
// 发布指导
export async function commentInsertRq(params) {
  return request.post(commentInsert, {
    body: params,
  });
}

// 目标动态
export async function commentSelectRq(params) {
  return request.get(toUrl(commentSelect, params));
}

// 目标评论与指导的详情接口
export async function commentSelectDetailRq(params) {
  return request.get(toUrl(commentSelectDetail, params));
}

// 点赞时调用的API
export async function commentLikeRq(params) {
  return request.post(commentLike, {
    body: params,
  });
}

// 发起工作流(新版本流程)
export async function flowSubmit(params) {
  return request.post(toUrl(launchFlow, { processDefinitionKey: params.defkey }), {
    body: params.value,
  });
}

// =================OKR个人首页=======================

// OKR个人首页 视图基础数据
export async function userHomeBaseDataRq(params) {
  return request.get(userHomeBaseData);
}

// okr个人首页 菜单快捷入口
export async function userHomeMyShortCutRq(params) {
  return request.get(userHomeMyShortCut);
}

// okr个人首页 目标列表权限控制
export async function userHomeObjectiveListRq(params) {
  return request.get(toQs(userHomeObjectiveList, params));
}

// okr个人首页 目标列表权限控制
export async function userHomeTodoTasksRq() {
  return request.get(userHomeTodoTasks);
}

// 目标实现路径
export async function targetPathMapRq(params) {
  return request.get(toQs(targetPathMap, params));
}

// ===============OKR运营报告==============
// 目标状态统计
export async function stateStatisRq(params) {
  return request.get(toQs(stateStatis, params));
}
// 目标更新统计
export async function updateStatisRq(params) {
  return request.get(toQs(updateStatis, params));
}
// 目标修改类别码
export async function updateObjectiveCat(params) {
  return request.put(objectiveCatUpdate, {
    body: params,
  });
}
// 根据目标状态获取 okr 详情
export async function getOkrListByStatusFn(params) {
  return request.get(toQs(getOkrListByStatus, params));
}
// 根据目标更新时间获取 okr 详情
export async function getOkrListByUpdateFn(params) {
  return request.get(toQs(getOkrListByUpdate, params));
}
