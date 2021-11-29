import { isNil, type } from 'ramda';
import api from '@/api';
import { toQs } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const VIDEO_REPO_API = '/api/person/v1/res/selfVideo/sfs/token';

const { download, list } = api.sfs;
const { saveSelfUrl } = api.user.center;

export async function queryPersonVideo(dataKey) {
  const apiRes = await request.get(toQs(VIDEO_REPO_API, { dataKey }));
  const asyncResponse = { status: 200, code: undefined, response: undefined };
  if (apiRes.status === 200 && !isNil(apiRes.response)) {
    const tokenInfo = type(apiRes.response) === 'Object' ? apiRes.response : {};
    const repoRes = await request.get(toQs(list, { dataKey, ...tokenInfo }));
    if (repoRes.status === 200 && !isNil(repoRes.response) && repoRes.response.length > 0) {
      const { itemHash } =
        type(repoRes.response[repoRes.length - 1]) === 'Object'
          ? repoRes.response[repoRes.length - 1]
          : {};
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

export async function saveSelf(params) {
  return request.patch(saveSelfUrl, {
    body: params,
  });
}
