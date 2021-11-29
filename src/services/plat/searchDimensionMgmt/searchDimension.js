import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  searchDimensionList,
  searchDimensionDelete,
  searchDimensionEdit,
  searchDimensionCatCodeList,
  saveSearchDimDetails,
  saveSearchDimEntity,
  saveSearchDimDetele,
  saveSearchDimList,
  SearchDimDEntity,
  SearchDimDDelete,
  SearchDimDList,
  SearchDimDCatCodeList,
} = api.plat.searchDimension;

// =======================查询维度列表====================
// 查询维度列表查询
export async function searchDimensionListRq(params) {
  return request.get(toQs(searchDimensionList, params));
}

// 查询维度列表保存
export async function searchDimensionEditRq(params) {
  return request.post(searchDimensionEdit, {
    body: params,
  });
}

// 查询维度列表删除
export async function searchDimensionDeleteRq(params) {
  return request.patch(toUrl(searchDimensionDelete, params));
}

// 查询维度新增类别码下拉列表
export async function searchDimensionCatCodeListRq(params) {
  return request.get(toUrl(searchDimensionCatCodeList, params));
}

// =======================查询维度====================

// 查询维度详情
export async function saveSearchDimDetailsRq(params) {
  return request.get(toUrl(saveSearchDimDetails, params));
}

// 查询维度保存
export async function saveSearchDimEntityRq(params) {
  return request.post(saveSearchDimEntity, {
    body: params,
  });
}

// 类别码明细删除
export async function saveSearchDimDeteleRq(params) {
  return request.patch(toUrl(saveSearchDimDetele, params));
}

// 查询维度列表
export async function saveSearchDimListRq(params) {
  return request.get(toUrl(saveSearchDimList, params));
}

// =======================查询维度明细====================
// 查询维度明细修改
export async function SearchDimDEntityRq(params) {
  return request.post(SearchDimDEntity, {
    body: params,
  });
}

// 查询维度明细列表
export async function SearchDimDListRq(params) {
  return request.get(toUrl(SearchDimDList, params));
}

// 查询维度明细列表删除
export async function SearchDimDDeleteRq(params) {
  return request.patch(toUrl(SearchDimDDelete, params));
}

// 查询维度明细类别码列表
export async function SearchDimDCatCodeListRq(params) {
  return request.get(toUrl(SearchDimDCatCodeList, params));
}
