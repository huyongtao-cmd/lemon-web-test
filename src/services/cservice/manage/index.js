/* eslint-disable no-redeclare */
import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  omCalendarConfig,
  calendarDetailCreate,
  calendarDelete,
  omCalendarConfigById,
  vewCalendarList,
  calendarListDetail,
  calendarListDetailById,
  feedBackById,
  feedBack,
  calendarDeleteList,
  generateListDetail,
} = api.cservice;
const { userMultiColSelect, projectMultiColSelect } = api.user;

// 根据筛选条件获取运维日历循环列表
export async function getCalendarList(params) {
  return request.get(toQs(omCalendarConfig, params));
}

// 根据id获取运维日历详情
export async function getManageDetailById(id) {
  return request.get(toUrl(omCalendarConfigById, { id }));
}

// 新增运维详情
export async function createCalendarDetail(data) {
  return request.post(calendarDetailCreate, {
    body: data,
  });
}

// 删除运维日历记录
export async function deleteCalendar(data) {
  return request.patch(toUrl(calendarDelete, data));
}

// 点击按钮，生成明细
export async function generateDetail(data) {
  return request.patch(toUrl(generateListDetail, data));
}

// 根据id获取运维事项明细
export async function getViewCalendarList(id) {
  return request.get(toUrl(vewCalendarList, { id }));
}

// 新增运维明细
export async function createCalendarListDetail(data) {
  return request.post(calendarListDetail, {
    body: data,
  });
}

// 删除运维日历记录明细
export async function deleteCalendarList(data) {
  return request.patch(toUrl(calendarDeleteList, data));
}

// 根据id获取运维事项明细详情
export async function getCalendarListDetailById(id) {
  return request.get(toUrl(calendarListDetailById, { id }));
}

// 根据id获取运维事项明细反馈
export async function getFeedBackById(id) {
  return request.get(toUrl(feedBackById, { id }));
}

// 反馈
export async function doFeedBack(data) {
  return request.post(feedBack, {
    body: data,
  });
}

// 资源编号
export async function selectUsersAll(params) {
  return request.get(toUrl(userMultiColSelect, { params }));
}
