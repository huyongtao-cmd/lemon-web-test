import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  topList,
  topListDetail,
  getTopListDetail,
  topListSave,
  topListDelete,
  changeShowFlag,
  topListdate,
  topListdateDetail,
} = api.sys.system;

// 榜单列表
export async function topListRq(params) {
  return request.get(toQs(topList, params));
}

// 榜单列表详情
export async function topListDetailRq(params) {
  return request.get(toUrl(topListDetail, params));
}

// 根据数据来源切换拉取榜单详细
export async function getTopListDetailRq(params) {
  return request.get(toUrl(getTopListDetail, params));
}

// 榜单新增和维护
export async function topListSaveRq(params) {
  return request.post(topListSave, {
    body: params,
  });
}

// 根据数据来源切换拉取榜单详细
export async function topListDeleteRq(params) {
  return request.delete(toUrl(topListDelete, params));
}

// 榜单列表更改是否显示状态
export async function changeShowFlagRq(params) {
  return request.post(toUrl(changeShowFlag, params));
}

// 琅琊榜榜单
export async function topListdateRq(params) {
  return request.get(toUrl(topListdate, params));
}

// 琅琊榜榜单详情
export async function topListdateDetailRq(params) {
  return request.get(toUrl(topListdateDetail, params));
}
