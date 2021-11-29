import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  videoList,
  videoEdit,
  videoDetail,
  videoDelete,
  videoCatData,
  selectVideoDrop,
  changeStatus,
} = api.plat.video;

// 视频列表查询
export async function videoListRq(params) {
  return request.get(toQs(videoList, params));
}

// 视频新增修改
export async function videoEditRq(params) {
  return request.post(videoEdit, {
    body: params,
  });
}

// 视频列表删除
export async function videoDeleteRq(params) {
  return request.patch(toUrl(videoDelete, params));
}

// 视频详情
export async function videoDetailRq(params) {
  return request.patch(toUrl(videoDetail, params));
}

// 视频类别数据
export async function videoCatDataRq(params) {
  return request.get(toUrl(videoCatData, params));
}

// 视频大类、视频小类、服务属性
export async function selectVideoDropRq(params) {
  return request.get(toUrl(selectVideoDrop, params));
}

// 视频新增修改
export async function changeStatusRq(params) {
  return request.post(toUrl(changeStatus, params));
}
