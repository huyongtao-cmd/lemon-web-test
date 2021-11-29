import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { prod } = api.demo;

// 单表场景
export async function testMainCreate(param) {
  return request.post(prod.testMainCreateUri, { body: param });
}
export async function testMainOverallModify(param) {
  return request.put(prod.testMainOverallModifyUri, { body: param });
}
export async function testMainPartialModify(param) {
  return request.put(prod.testMainPartialModifyUri, { body: param });
}
export async function testMainDetail(param) {
  return request.get(toUrl(prod.testMainDetailUri, param));
}
export async function testMainListPaging(param) {
  return request.get(toQs(prod.testMainListPagingUri, param));
}
export async function testMainLogicalDelete(param) {
  return request.patch(toQs(prod.testMainLogicalDeleteUri, param));
}
