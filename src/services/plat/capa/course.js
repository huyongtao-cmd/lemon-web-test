import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  capaApprovalHistory,
  getCourseList,
  editCourse,
  changeCourseStatus,
  deleteCourseApi,
  addCourse,
  uploadCourse,
  getResCapaSet,
  getResCapaStatus,
  saveTaskCapa,
  taskCapa,
} = api.user.ability;

export async function queryCapaApprovalHistory(params) {
  return request.get(toQs(capaApprovalHistory, params));
}

export async function queryCourseList(params) {
  return request.get(toQs(getCourseList, params));
}

export async function changeCourseStatusFn({ id }) {
  return request.post(toUrl(changeCourseStatus, { id }));
}

export async function addCourseFn(params) {
  return request.post(addCourse, {
    body: params,
  });
}

export async function editCourseFn(params) {
  return request.post(editCourse, {
    body: params,
  });
}

export async function deleteCourseFn({ ids }) {
  return request.patch(toUrl(deleteCourseApi, { ids }));
}

export async function uploadCourseFn(params) {
  return request.post(uploadCourse, {
    body: params,
  });
}

export async function queryResCapaSet(params) {
  return request.get(toQs(getResCapaSet, params));
}

export async function queryResCapaStatus(params) {
  return request.get(toQs(getResCapaStatus, params));
}

export async function saveTaskCapaFn(params) {
  return request.put(saveTaskCapa, {
    body: params,
  });
}

export async function queryTaskCapa() {
  return request.get(taskCapa);
}
