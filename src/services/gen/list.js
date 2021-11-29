import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  userMultiColSelect,
  userMcTaskSelect,
  buMultiColSelect,
  capasetLevelSelectBy,
  capasetLevelSelect,
  capaLevelSelect,
  taskSelect,
  projSelect,
  buSelect,
  activeBuSelect,
  projectBySelect,
  ousSelect,
  ousSelectByAbNo,
  custSelect,
  buProductSelect,
  projectSelect,
  allTaskSelect,
  abOuSelect,
  allAbOuSelect,
  productClass,
  beginPeriodSelect,
  internalOuSelect,
  taskByProjIdSelect,
  iamUserSelect,
  iamAllUserSelect,
  equaTaskByProjectIdSelect,
  coopSelect,
  buAndMember,
  buMemberList,
  userInJobSelect,
  buPriceList,
  queryPageBlock,
  queryPageField,
  queryBuPageField,
  externalUser,
  selectTenantProc,
} = api.user;

// 合作伙伴下拉
export async function selectCoop(params) {
  return request.get(toQs(coopSelect, params));
}
// 人员(资源)数据 下拉
export async function selectUsers(params) {
  return request.get(userMultiColSelect);
}

export async function selectUsersWithBu(params) {
  return request.get(userMcTaskSelect);
}

// 选择在职人员 有base地 部门
export async function selectUsersInJob(params) {
  return request.get(userInJobSelect);
}

// 选择BU和下属
export async function selectBuMember(params) {
  return request.get(buAndMember);
}

// 选择BU资源
export async function selectbuMemberList(params) {
  return request.get(buMemberList);
}

// bu数据 下拉
export async function selectBus(params) {
  return request.get(buMultiColSelect);
}

// 复合能力级别数据根据工种、工种子类 下拉
export async function selectCapasetLevelBy(params) {
  return request.get(toQs(capasetLevelSelectBy, params));
}

// 复合能力级别数据 下拉
export async function selectCapasetLevel() {
  return request.get(capasetLevelSelect);
}

// 单项能力级别数据 下拉
export async function selectCapaLevel() {
  return request.get(capaLevelSelect);
}

// 任务包下拉
export async function selectUserTask(params) {
  return request.get(toQs(taskSelect, params));
}

// 项目下拉
export async function selectUserProj(params) {
  return request.get(toQs(projSelect, params));
}

// BU下拉 - 公司
export async function selectBusWithOus(params) {
  return request.get(toQs(buSelect, params));
}

// 激活状态的BU - 单列BU下拉
export async function selectActiveBu(params) {
  return request.get(toQs(activeBuSelect, params));
}

// 相关项目 - 下拉
export async function selectProjectBy(resId) {
  return request.get(toUrl(projectBySelect, resId));
}

// 公司下拉数据
export async function selectOus(params) {
  return request.get(toQs(ousSelect, params));
}

// 公司下拉数据
export async function selectOusByAbNo(params) {
  return request.get(toUrl(ousSelectByAbNo, params));
}

// 关联产品下拉数据
export async function getProductClass() {
  return request.get(productClass);
}

// 客户下拉数据
export async function selectCusts() {
  return request.get(custSelect);
}

// bu产品下拉数据
export async function selectBuProduct() {
  return request.get(buProductSelect);
}

// 所有项目下拉数据
export async function selectProject() {
  return request.get(projectSelect);
}

// 任务下拉数据
export async function selectAllTask() {
  return request.get(allTaskSelect);
}

// 法人地址下拉数据
export async function selectAbOus() {
  return request.get(abOuSelect);
}

// 新增供应商下拉数据
export async function selectAllAbOu() {
  return request.get(allAbOuSelect);
}

// 业务开始年期下拉数据
export async function selectBeginPeriods() {
  return request.get(beginPeriodSelect);
}

// 内部公司下拉数据
export async function selectInternalOus() {
  return request.get(internalOuSelect);
}

// 根据项目查询相关任务下拉数据
export async function selectTaskByProjIds(projId) {
  return request.get(toUrl(taskByProjIdSelect, projId));
}

// 登录用户（不是资源）数据 下拉
export async function selectIamUsers() {
  return request.get(iamUserSelect);
}

// 全部用户（不是资源）数据 下拉
export async function selectIamAllUsers() {
  return request.get(iamAllUserSelect);
}

export async function selectTaskByProjIdInEqua(id) {
  return request.get(toUrl(equaTaskByProjectIdSelect, { id }));
}

// BU当量定价管理中 两个页面的BU下拉框
export async function selectbuPriceList(params) {
  return request.get(toQs(buPriceList, params));
}

// 区域选择
export async function selectPageBlock(key) {
  return request.get(toUrl(queryPageBlock, { key }));
}

// 表单字段选择
export async function selectPageField(key) {
  return request.get(toUrl(queryPageField, { key }));
}

// 表单bu负责人字段选择
export async function selectBuPageField(params) {
  return request.get(toUrl(queryBuPageField, params));
}

// 查询外部资源
export async function selectExternalUser(params) {
  return request.get(externalUser);
}

// 登录用户（不是资源）数据 下拉
export async function tenantProc() {
  return request.get(selectTenantProc);
}
