import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  other,
  day,
  month,
  rule: { list, save, detail, del },
  abNormalrule: {
    abNormalList,
    abNormalSave,
    abNormalDetail,
    abNormalDel,
    abNormalUpdate,
    abNormalSwitch,
    abNormalInfo,
    monthExcel,
  },
  attendanceRemark,
  updateRemarkStatus,
} = api.plat.attendance;

export async function queryOtherList(params) {
  return request.get(toQs(other, params));
}
export async function queryDayList(params) {
  return request.get(toQs(day, params));
}
export async function queryMonthList(params) {
  return request.get(toQs(month, params));
}
export async function queryRemarkList(params) {
  return request.get(toQs(attendanceRemark, params));
}
export async function updateRemarkStatusHandle(params) {
  return request.put(updateRemarkStatus, {
    body: params,
  });
}

// 规则
export async function ruleList(params) {
  return request.get(toQs(list, params));
}

export async function ruleSave(params) {
  return request.post(save, {
    body: params,
  });
}

export async function ruleEdit(params) {
  return request.put(save, {
    body: params,
  });
}

export async function ruleDetail(id) {
  return request.get(toUrl(detail, { id }));
}

export async function ruleDel(ids) {
  return request.patch(toUrl(del, { ids }));
}

// 异常算法
export async function abNormalRuleList(params) {
  return request.get(toQs(abNormalList, params));
}

export async function abNormalRuleSave(params) {
  return request.post(abNormalSave, {
    body: params,
  });
}

export async function abNormalRuleDetail(id) {
  return request.get(toUrl(abNormalDetail, { id }));
}

export async function abNormalRuleDel(ids) {
  return request.patch(toUrl(abNormalDel, { ids }));
}

export async function abNormalRuleUpdate(params) {
  return request.patch(abNormalUpdate, {
    body: params,
  });
}

export async function abNormalRuleSwitch(id) {
  return request.patch(toUrl(abNormalSwitch, { id }));
}

// 获取异常表达式字段说明
export async function getAbNormalInfo(proType) {
  return request.get(toUrl(abNormalInfo, { proType }));
}

// 导出月度报表
export async function exportMonthExcel(params) {
  return request.get(toQs(monthExcel, params));
}
