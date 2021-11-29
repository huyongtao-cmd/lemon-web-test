import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  catCodeList,
  catCodeSave,
  catCodeDelete,
  catCodeDetails,
  catCodeDetailList,
  catCodeDetailSave,
  catCodeDetailDetele,
  catCodeDetailDetails,
  catCodeDetailTabField,
  catCodeDValDetails,
  catCodeDValSave,
  catCodeDValInsert,
  selectSupCatDVal,
  catCodeDValNodeSave,
  catCodeDValNodeDetele,
} = api.plat.catCode;

// =======================类别码列表====================
// 类别码列表查询
export async function catCodeListRq(params) {
  return request.get(toQs(catCodeList, params));
}

// 类别码列表保存
export async function catCodeSaveRq(params) {
  return request.post(catCodeSave, {
    body: params,
  });
}

// 类别码列表删除
export async function catCodeDeleteRq(params) {
  return request.patch(toUrl(catCodeDelete, params));
}

// 类别码列表详情
export async function catCodeDetailsRq(params) {
  return request.get(toUrl(catCodeDetails, params));
}

// =======================类别码明细====================
// 类别码明细列表、上级类别码列表
export async function catCodeDetailListRq(params) {
  return request.get(toUrl(catCodeDetailList, params));
}

// 类别码明细保存
export async function catCodeDetailSaveRq(params) {
  return request.post(catCodeDetailSave, {
    body: params,
  });
}

// 类别码明细删除
export async function catCodeDetailDeteleRq(params) {
  return request.patch(toUrl(catCodeDetailDetele, params));
}

// 类别码明细详情
export async function catCodeDetailDetailsRq(params) {
  return request.patch(toUrl(catCodeDetailDetails, params));
}

// 类别码明细表字段下拉
export async function catCodeDetailTabFieldRq(params) {
  return request.get(toUrl(catCodeDetailTabField, params));
}

// =======================类别码明细值====================
// 类别码明细值详情
export async function catCodeDValDetailsRq(params) {
  return request.get(toUrl(catCodeDValDetails, params));
}

// 类别码明细值修改
export async function catCodeDValSaveRq(params) {
  return request.post(catCodeDValSave, {
    body: params,
  });
}

// 类别码明细值维护
export async function catCodeDValInsertRq(params) {
  return request.post(catCodeDValInsert, {
    body: params,
  });
}

// 类别码明细值详情
export async function selectSupCatDValRq(params) {
  return request.get(toUrl(selectSupCatDVal, params));
}

// 类别码明细值节点新增
export async function catCodeDValNodeSaveRq(params) {
  return request.post(catCodeDValNodeSave, {
    body: params,
  });
}

// 类别码明细值节点删除
export async function catCodeDValNodeDeteleRq(params) {
  return request.patch(toUrl(catCodeDValNodeDetele, params));
}
