import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { res, computer } = api.plat;
const { applyList, applyMyList, applySubmit, applyDetail, applyCreate, applyDelete } = computer;

// 查询自购电脑申请列表
export async function queryList(params) {
  return request.get(toQs(applyList, params));
}

// 查询我的个人信息的 自购电脑申请列表
export async function queryMyList(params) {
  return request.get(applyMyList);
}

// 查询单条数据
export async function findComputerById(id) {
  return request.get(toUrl(applyDetail, { id }));
}

// 新增
export async function create(params) {
  return request.post(applyCreate, {
    body: params,
  });
}

// 编辑
export async function update(params) {
  return request.put(applyCreate, {
    body: params,
  });
}

// 删除多条自购电脑申请单
export async function deleteComputers(ids) {
  return request.patch(toUrl(applyDelete, { ids: ids.join(',') }));
}

// 根据resId查询个人相关信息
export async function findResById(id) {
  return request.get(toUrl(res, { id }));
}

// 新增流程
export async function createApply(id) {
  return request.post(toUrl(applySubmit, { id }));
}
