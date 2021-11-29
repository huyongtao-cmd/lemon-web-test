import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { adm } = api.production;

export async function copyrightCreate(param) {
  return request.post(adm.copyrightCreateUri, { body: param });
}
export async function copyrightDetail(param) {
  return request.get(toUrl(adm.copyrightDetailUri, param));
}
export async function copyrightOverallModify(param) {
  return request.put(adm.copyrightOverallUri, { body: param });
}

export async function copyrightLogicalDelete(param) {
  return request.patch(toQs(adm.copyrightDeleteUri, param));
}

export async function copyrightPaging(param) {
  return request.get(toQs(adm.copyrightPgingUri, param));
}
