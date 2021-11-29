import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';
import { isNil, type } from 'ramda';

const {
  create,
  update,
  query,
  deleteById,
  themeAbilityCreate,
  themeAbilityQuery,
  deleteAbilityById,
  themeProcess,
  themeProcessUpdate,
  queryByReportId,
  queryReportData,
  saveReportData,
  updateReportData,
  queryThemeById,
} = api.user.product;

// 主题新增
export async function createTheme(params) {
  return request.post(create, {
    body: params,
  });
}

// 主题修改
export async function updateTheme(params) {
  return request.put(update, { body: params });
}
// 查找主题
export async function queryTheme(params) {
  return request.get(toQs(query, params));
}

// 删除主题
export async function deleteTheme(id) {
  return request.patch(toUrl(deleteById, { id }));
}

// 主题能力新增
export async function abilityCreate(params) {
  return request.post(themeAbilityCreate, {
    body: params,
  });
}

// 查找能力地图
export async function queryThemeAbility(id) {
  return request.get(toUrl(themeAbilityQuery, id));
}

// 删除能力地图 能力
export async function deleteAbility(id) {
  return request.delete(toUrl(deleteAbilityById, { id }));
}

// 获取主题流程
export async function queryThemeProcess(id) {
  return request.get(toUrl(themeProcess, id));
}

// 获取主题流程修改和新增
export async function updateThemeProcess(id, params) {
  return request.put(toUrl(themeProcessUpdate, { id }), { body: params });
}

// 获取主题报表
export async function queryByReportById(id) {
  return request.get(toUrl(queryByReportId, { id }));
}
// 获取主题报表数据
export async function queryReportDataById(id) {
  return request.get(toUrl(queryReportData, { id }));
}

// 主题 报表的新增
export async function saveReportSource(themeId, location, params) {
  console.log('locationlocation', location);
  return request.post(toUrl(saveReportData, { themeId, location }), {
    body: params,
  });
}

// 主题 报表修改
export async function updateReportDataSource(themeId, reportId, location, params) {
  return request.put(toUrl(updateReportData, { themeId, reportId, location }), { body: params });
}

// 查找主题根据id
export async function getThemeById(id) {
  return request.get(toUrl(queryThemeById, { id }));
}
