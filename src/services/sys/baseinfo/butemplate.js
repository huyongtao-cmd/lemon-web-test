import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  butemplates,
  butemplate,
  butempDel,
  butempStatus,
  butmplRoles,
  butmplIncomes,
  butmplEqvas,
  butmplOperations,
  butmplexamPeriods,
  butmplSaveOperation,

  accTmplSelect,
  buTmplResSelect,
  buTmplRoleSelect,
} = api.sys;
const { financeCalendarSelect } = api.user;
const { buClassTree } = api.org;

// 查询列表
export async function findButemplates(params) {
  return request.get(toQs(butemplates, params));
}

// 查询单条信息
export async function findButemplateById(id) {
  return request.get(toUrl(butemplate, { id }));
}
// 新增
export async function create(params) {
  return request.post(butemplates, {
    body: params,
  });
}
// 修改
export async function update(params) {
  return request.put(toUrl(butemplate, { id: params.id }), {
    body: params,
  });
}
// 批量删除bu模板
export async function deleteButemplate(ids) {
  return request.patch(toUrl(butempDel, { ids: ids.join(',') }));
}
// 激活
export async function updateButempStatus(params) {
  return request.patch(toUrl(butempStatus, { ids: params.id.join(','), status: params.statu }));
}
// 角色列表
export async function findRoles(params) {
  return request.get(toQs(butmplRoles, params));
}
// 保存角色列表
export async function saveRoles(params) {
  return request.put(butmplRoles, {
    body: params,
  });
}

// 资源当量收入列表
export async function findIncomes(params) {
  return request.get(toQs(butmplIncomes, { tmplId: params.tmplId }));
}
// 保存资源当量收入
export async function saveIncomes(params) {
  return request.put(butmplIncomes, { body: params });
}
// 经营范围列表
export async function saveOperations(params) {
  return request.put(butmplSaveOperation, { body: params });
}

// 经营范围列表
export async function findOperations(params) {
  return request.get(toQs(butmplOperations, { tmplId: params.tmplId }));
}
// 考核期间列表
export async function findExamPeriods(params) {
  return request.get(toQs(butmplexamPeriods, { tmplId: params.tmplId }));
}

// 查询科目模板下拉数据 tmplClass参数必填
export async function findAccTmplSelect(params) {
  return request.get(toQs(accTmplSelect, params));
}

// 查询bu模板资源下拉数据
export async function findBuTmplResSelect() {
  return request.get(buTmplResSelect);
}

// 查询bu模板角色下拉数据
export async function findBuTmplRoleSelect() {
  return request.get(buTmplRoleSelect);
}

// 产品分类树
export async function queryClassTrees(params) {
  return request.get(buClassTree);
}

// 查询财务日历格式下拉数据
export async function selectFinanceCalendar() {
  return request.get(financeCalendarSelect);
}
