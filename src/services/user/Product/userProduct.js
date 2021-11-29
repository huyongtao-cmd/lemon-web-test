import { isNil, type } from 'ramda';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const VIDEO_REPO_API = '/api/base/v1/buProd/video/sfs/token';

const { queryProductList, queryProdCaseList } = api.sys;
const { download, list } = api.sfs;

const { cooperativeList, coopDetail } = api.user.product;

export async function queryProduct(params) {
  return request.get(toQs(queryProductList, params));
}

export async function queryProductCase(params) {
  return request.get(toQs(queryProdCaseList, params));
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

// 找合作伙伴列表
export async function cooperativeListRq(params) {
  return request.get(toQs(cooperativeList, params));
}

// 合作伙伴详情
export async function coopDetailRq(id) {
  return request.get(toUrl(coopDetail, id));
}
