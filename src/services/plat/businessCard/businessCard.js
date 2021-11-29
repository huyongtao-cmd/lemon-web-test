import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { res } = api.plat;
const { saveBusinessCard, selectFlowDetail } = api.plat.businessCard;

// 获取资源详情
export async function findResById(id) {
  return request.get(toUrl(res, { id }));
}

// 保存:新增+修改；发起流程+推流程
export async function saveBusinessCardRq(params) {
  return request.post(saveBusinessCard, {
    body: params,
  });
}

// 获取流程详情
export async function selectFlowDetailRq(id) {
  return request.get(toUrl(selectFlowDetail, id));
}

// // 删除
// export async function deleteApiRq(ids) {
//   return request.patch(toUrl(deleteApi, ids));
// }

// // 详情
// export async function detailRq(ids) {
//   return request.get(toUrl(detail, ids));
// }

// // 列表
// export async function listRq(params) {
//   return request.get(toQs(list, params));
// }
