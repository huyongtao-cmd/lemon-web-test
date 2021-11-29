import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import { isNil, type } from 'ramda';

const VIDEO_REPO_API = '/api/base/v1/catVideo/video/sfs/token';

const { selectVideoDrop, videoList } = api.plat.video;

const {
  selectVideoSynList,
  homePageTab,
  tabSelectLabel,
  videoSearchList,
  menuListLeft,
  selectVideoCon,
} = api.sale.showHomePage;

const { download, list } = api.sfs;

// 展示厅首页 - table数据条件查询
export async function selectVideoConRq(params) {
  return request.get(toQs(selectVideoCon, params));
}

// 展示厅首页 - tab下左侧的侧边栏
export async function menuListLeftRq(params) {
  return request.get(toUrl(menuListLeft, params));
}

// 展示厅首页 - 视频数据
export async function videoSearchListRq(params) {
  const { code, ...newParmars } = params;
  return request.get(toQs(toUrl(videoSearchList, { code }), newParmars));
}

// 展示厅首页 - tab切换拉取展示标签
export async function tabSelectLabelRq(params) {
  return request.get(toQs(tabSelectLabel, params));
}

// 展示厅首页 - tab
export async function homePageTabRq(params) {
  return request.get(toQs(homePageTab, params));
}

// 视频列表查询
export async function selectVideoSynListRq(params) {
  return request.get(toQs(selectVideoSynList, params));
}

// 视频大类、视频小类、服务属性
export async function selectVideoDropRq(params) {
  return request.get(toUrl(selectVideoDrop, params));
}

export async function queryProductionVideo(dataKey) {
  const apiRes = await request.get(toQs(VIDEO_REPO_API, { dataKey }));
  const asyncResponse = { status: 200, code: undefined, response: undefined };
  if (apiRes.status === 200 && !isNil(apiRes.response)) {
    const tokenInfo = type(apiRes.response) === 'Object' ? apiRes.response : {};
    const repoRes = await request.get(toQs(list, { dataKey, ...tokenInfo }));
    if (repoRes.status === 200 && !isNil(repoRes.response)) {
      const { itemHash } = type(repoRes.response[0]) === 'Object' ? repoRes.response[0] : {};
      return {
        status: 200,
        code: 200,
        // eslint-disable-next-line
        response: toQs(`${SERVER_URL}${download}`, { dataKey, ...tokenInfo, hash: itemHash }),
      };
    }
    return asyncResponse;
  }
  return asyncResponse;
}

// // 视频新增修改
// export async function videoEditRq(params) {
//   return request.post(videoEdit, {
//     body: params,
//   });
// }
