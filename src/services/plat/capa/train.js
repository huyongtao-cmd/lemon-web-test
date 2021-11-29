import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  courseTree,
  exchangeSortNo,
  addAndUpdate,
  updateState,
  deleteClass,
  capaListUdc,
  capaList,
  capaSetList,
  courseList,
  courseDetail,
  courseDetailPush,
  saveCourse,
  deleteCourse,
  pushCourseCapa,
  pushCourseCapaSet,
  detailCourseList,
  queryCourse,
  courseState,
  pushCourse,
  getRes,
  getResType,
} = api.user.ability;

// 拉取分类树
export async function queryCourseTree(params) {
  return request.get(toQs(courseTree, params));
}
// 交换位置
export async function exchangeSortNoHandle(params) {
  return request.patch(toQs(exchangeSortNo, params));
}
// 新增分类或者更新分类
export async function addAndUpdateHandle(payload) {
  return request.post(addAndUpdate, { body: payload });
}

// 更新启用停用状态
export async function updateStateHandle(params) {
  return request.patch(toUrl(updateState, params));
}
// 删除 id
export async function deleteClassHandle({ id }) {
  return request.patch(toUrl(deleteClass, { id }));
}

// 获取单项能力分类 UDC 树
export async function queryCapaListUdcTree() {
  return request.get(capaListUdc);
}

// 根据 分类 UDC 筛选单项能力列表
export async function queryCapaList(params) {
  return request.get(toQs(capaList, params));
}

// 复合能力下拉
export async function queryCapaSetList() {
  return request.get(capaSetList);
}

// 培训项目列表查询
export async function queryCourseList(params) {
  return request.get(toQs(courseList, params));
}

// 获取培训项目详情
export async function getCourseDetail({ id }) {
  return request.get(toUrl(courseDetail, { id }));
}

// 获取推送项目详情
export async function getCourseDetailPush({ id }) {
  return request.get(toUrl(courseDetailPush, { id }));
}

// 保存推送项目详情
export async function saveCourseHandle(payload) {
  return request.post(saveCourse, { body: payload });
}

// 删除培训项目
export async function deleteCourseHandle({ ids }) {
  return request.patch(toUrl(deleteCourse, { ids }));
}

// 获取推送页面单项能力数据
export async function getPushCourseCapa(params) {
  return request.get(toQs(pushCourseCapa, params));
}

// 获取推送页面复合能力数据
export async function getPushCourseCapaSet(params) {
  return request.get(toQs(pushCourseCapaSet, params));
}

// 培训详情课程查询
export async function getDetailCourseList(params) {
  return request.get(toQs(detailCourseList, params));
}

// 查询启用课程列表
export async function queryCourseHandle(params) {
  return request.get(toQs(queryCourse, params));
}

// 启用/停用课程
export async function courseStateHandle(params) {
  return request.patch(toUrl(courseState, params));
}

// 培训项目推送
export async function pushCourseHandle(payload) {
  return request.put(pushCourse, { body: payload });
}

// 获取资源
export async function queryRes() {
  return request.get(getRes);
}

// 获取资源类型
export async function queryResType() {
  return request.get(getResType);
}
