/* eslint-disable no-redeclare */
import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  meetingRoomCreate,
  meetingRoomUpdate,
  meetingRoomDelete,
  getMeetingRoomPlaceList,
  getMeetingRoomNameList,
  getMeetingRoomList,
  getMeetingRoomDetail,
  reservedRoomList,
  reservedRoomDetail,
  reservedRoomListByWeek,
  removeReservedRoom,
  reservedRoomCreate,
  reservedRoomUpdate,
} = api.user.meeting;

// 根据id获取会议室详情
export async function getMeetingRoomById(id) {
  return request.get(toUrl(getMeetingRoomDetail, { id }));
}

// 获取会议室地址
export async function getMeetingRoomPlace() {
  return request.get(getMeetingRoomPlaceList);
}

// 获取会议室名称列表（返回'会议室名称-会议室地点'集合） ,
export async function getMeetingRoomName(id) {
  return request.get(getMeetingRoomNameList);
}
// 新增会议室
export async function createMeetingRoom(data) {
  return request.post(meetingRoomCreate, {
    body: data,
  });
}

// 根据筛选条件获取会议室列表
export async function getRoomList(params) {
  return request.get(toQs(getMeetingRoomList, params));
}

// 更新会议室
export async function updateMeetingRoom(data) {
  return request.patch(meetingRoomUpdate, { body: data });
}

// 删除会议室
export async function deleteMeetingRoom(data) {
  return request.patch(toUrl(meetingRoomDelete, data));
}

// 新增会议室预约
export async function createReservedRoom(data) {
  return request.post(reservedRoomCreate, { body: data });
}

// 更新会议室预约
export async function updateReservedRoom(data) {
  return request.patch(reservedRoomUpdate, { body: data });
}

// 根据筛选条件获取会议室预约列表
export async function getReservedRoomList(params) {
  return request.get(toQs(reservedRoomList, params));
}

// 根据id获取会议室预约详情
export async function getReservedRoomById(id) {
  return request.get(toUrl(reservedRoomDetail, { id }));
}

// 删除会议室预约
export async function deleteReservedRoom(data) {
  return request.patch(toUrl(removeReservedRoom, data));
}

// 按周查询会议室预约列表
export async function getReservedRoomListByWeek(startDate, endDate) {
  return request.get(toUrl(reservedRoomListByWeek, { startDate, endDate }));
}
