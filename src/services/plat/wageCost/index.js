import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

// const {
//   queryWageCostList, // 获取薪资成本列表
//   delWageCostItem, // 删除薪资成本列表
// } = api.plat.expense;

// 薪资成本列表
export async function queryWageCostList(params) {
  return request.get(toQs(api.plat.wageCost.queryWageCostList, params));
}

// 删除
export async function delWageCostItem(payload) {
  const { masterId } = payload;
  return request.patch(toUrl(api.plat.wageCost.delWageCostItem, { masterId }));
}
// 查看详情
export async function getViewWageCost(payload) {
  const { sacMacNo } = payload;
  return request.patch(toUrl(api.plat.wageCost.getViewItem, { sacMacNo }));
}

// 详情页保存
export async function saveWageCost(params) {
  return request.post(api.plat.wageCost.saveDetailWageCost, { body: params });
}
// 详情页更新
export async function updateWageCost(params) {
  return request.post(api.plat.wageCost.updateDetailWageCost, { body: params });
}
// 生成付款对象
export async function createPayObj(params) {
  return request.post(`${api.plat.wageCost.createPayObj}/${params.id}`);
}
// payObj保存
export async function savePayObj(params) {
  return request.post(`${api.plat.wageCost.savePayObj}/${params.id}`, {
    body: params.viewList,
  });
}
// payObj更新
export async function updatePayObj(params) {
  return request.post(`${api.plat.wageCost.updatePayObj}`, {
    body: params.viewList,
  });
}
// 生成BU成本
export async function createBU(params) {
  return request.post(`${api.plat.wageCost.createBU}/${params.id}`);
}
// BU保存
export async function saveBU(params) {
  return request.post(`${api.plat.wageCost.saveBU}/${params.id}`, {
    body: params.viewList,
  });
}
// BU更新
export async function updateBU(params) {
  return request.post(`${api.plat.wageCost.updateBU}`, {
    body: params.viewList,
  });
}
// 提交
export async function submitWageCost(id) {
  return request.patch(toUrl(api.plat.wageCost.submitWageCost, id));
}
// payObj表格内下拉框
export async function selectReason(abNo) {
  return request.get(toUrl(api.plat.wageCost.paymentSelect, abNo));
}
// 获取详情
export async function getViewItem(id) {
  return request.get(toUrl(api.plat.wageCost.getViewItem, id));
}
// 驳回后重新提交
export async function flowPush(params) {
  return request.post(`${api.plat.wageCost.flowPush}/${params.id}`, {
    body: { ...params.boby },
  });
}
