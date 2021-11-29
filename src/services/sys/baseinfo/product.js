import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  queryProdsList,
  queryProductById,
  prodClassesTree,
  prodClassesTreeSub,
  putaway,
  soldOut,
  enterInspect,
  outInspect,
  saveProduct,
  deleteProduct,
  queryProdCaseList,
  saveProductCate,
  saveProdCaseList,
} = api.sys;

export async function queryProdList(params) {
  return request.get(toQs(queryProdsList, params));
}

export async function queryProduct(id) {
  return request.get(toUrl(queryProductById, { id }));
}

export async function queryProdClassesTree(params) {
  return request.get(prodClassesTree);
}

export async function queryProdClassesTreeSub(params) {
  return request.get(toUrl(prodClassesTreeSub, params));
}

export async function doPutaway(ids) {
  return request.patch(toUrl(putaway, { ids: ids.join(',') }));
}

export async function doSoldOut(ids) {
  return request.patch(toUrl(soldOut, { ids: ids.join(',') }));
}

export async function doInspect(id) {
  return request.patch(toUrl(enterInspect, { id }));
}

export async function finishInspect(id) {
  return request.patch(toUrl(outInspect, { id }));
}

export async function saveProd(params) {
  return request.post(saveProduct, {
    body: params,
  });
}

export async function saveProdCate(params) {
  return request.post(saveProductCate, {
    body: params,
  });
}

export async function deleteProdPord(ids) {
  return request.patch(toUrl(deleteProduct, { ids: ids.join(',') }));
}

export async function queryProdCase(params) {
  return request.get(toQs(queryProdCaseList, params));
}

export async function saveProdCase(params) {
  return request.put(saveProdCaseList, {
    body: params,
  });
}

export async function uploadPic(params) {
  return request('/api/base/v1/buProd/upload', {
    headers: {
      'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundarywxJCGPZ27qFxD5Oi',
    },
    method: 'post',
    Accept: '*/*',
    body: params,
  });
}
