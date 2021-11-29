import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  helpPageCreateUri,
  helpPageModifyUri,
  helpPageDetailUri,
  helpPageListPagingUri,
  helpPageLogicalDeleteUri,
  helpPagePreviewByUrlUri,
  helpPageTreeUri,
  helpPageUpdateDirectoryVisibleUri,

  helpDirectoryCreateUri,
  helpDirectoryModifyUri,
  helpDirectoryDetailUri,
  helpDirectoryListPagingUri,
  helpDirectoryLogicalDeleteUri,
  helpDirectoryTreeUri,
} = api.sys.system;

// 帮助页面
export async function helpPageCreate(param) {
  return request.post(helpPageCreateUri, { body: param });
}
export async function helpPageModify(param) {
  return request.put(helpPageModifyUri, { body: param });
}
export async function helpPageDetail(param) {
  return request.get(toUrl(helpPageDetailUri, param));
}
export async function helpPageListPaging(param) {
  return request.get(toQs(helpPageListPagingUri, param));
}
export async function helpPageLogicalDelete(param) {
  return request.patch(toQs(helpPageLogicalDeleteUri, param));
}
export async function helpPageTree(param) {
  return request.get(toQs(helpPageTreeUri, param));
}
export async function helpPageUpdateDirectoryVisible(param) {
  return request.patch(toQs(helpPageUpdateDirectoryVisibleUri, param));
}

// 帮助目录
export async function helpDirectoryCreate(param) {
  return request.post(helpDirectoryCreateUri, { body: param });
}
export async function helpDirectoryModify(param) {
  return request.put(helpDirectoryModifyUri, { body: param });
}
export async function helpDirectoryDetail(param) {
  return request.get(toUrl(helpDirectoryDetailUri, param));
}
export async function helpDirectoryListPaging(param) {
  return request.get(toQs(helpDirectoryListPagingUri, param));
}
export async function helpDirectoryLogicalDelete(param) {
  return request.patch(toQs(helpDirectoryLogicalDeleteUri, param));
}
export async function helpDirectoryTree(param) {
  return request.get(toQs(helpDirectoryTreeUri, param));
}
export async function helpPagePreviewByUrl(param) {
  return request.get(toQs(helpPagePreviewByUrlUri, param));
}
