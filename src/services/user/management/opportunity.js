import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { custMultiColSelect, productMultiColSelect, suppMultiColSelect, management } = api.user;
const {
  opportunities,
  opportunitie,
  oppoCases,
  oppoCaseSave,
  oppoCompes,
  oppoCompeSave,
  oppoExtrafees,
  oppoExtrafeeSave,
  oppoPartners,
  oppoPartnerSave,
  oppoSalelists,
  oppoSaleSave,
  oppoShs,
  oppoShSave,
  oppoCloseReason,
  oppoActive,
  oppoPending,
  oppoCategory,
  oppoOpen,
  // 成本估算、报价、利益分配、渠道费用
  costeSave,
  costeDel,
  costeUpdate,
  costeList,
  updateStatus,
  saveFlow,
  saveFlowDetail,
  costePass,

  benefitSave,
  benefitList,
  benefitDel,
  benefitUpdateStatus,
  benefitFlowDetail,
  benefitSaveFlow,
  benefitPass,

  channelSave,
  channelList,
  channelDel,
  channelUpdateState,
  channelFlowDetail,
  channelSaveFlow,
  channelPass,

  // 报价
  getCosteId,
  offerSave,
  offerList,
  offerDel,
  offerUpdate,
  offerUpdateStatus,
  updateOfferlStatus,
  offerSaveFlow,
  offerPass,
  offerFlowDetail,
} = management;
// =================报价===================
// 报价列表改变已报客户状态
export async function updateOfferlStatusRq(params) {
  return request.post(toUrl(updateOfferlStatus, params));
}

// 获取已激活成本估算规则Id
export async function getCosteIdRq(params) {
  return request.get(toUrl(getCosteId, params));
}

// 第二节点多人审批通过
export async function offerPassRq(params) {
  return request.post(offerPass, {
    body: params,
  });
}

// 报价流程起流程
export async function offerSaveFlowRq(params) {
  return request.post(offerSaveFlow, {
    body: params,
  });
}

// 报价流程详情
export async function offerFlowDetailRq(params) {
  return request.get(toUrl(offerFlowDetail, params));
}

// 报价列表改变激活状态
export async function offerUpdateStatusRq(params) {
  return request.post(toUrl(offerUpdateStatus, params));
}

// 报价列表更新保存
export async function offerUpdateRq(params) {
  return request.post(offerUpdate, {
    body: params,
  });
}

// 报价列表删除
export async function offerDelRq(params) {
  return request.delete(toUrl(offerDel, params));
}

// 报价列表
export async function offerListRq(params) {
  return request.get(toUrl(offerList, params));
}

// 报价新增/修改、 启流程接口
export async function offerSaveRq(params) {
  return request.post(offerSave, {
    body: params,
  });
}

// =========================渠道费用===================
// 第二节点多人审批通过
export async function channelPassRq(params) {
  return request.post(channelPass, {
    body: params,
  });
}

// 流程詳情
export async function channelFlowDetailRq(params) {
  return request.get(toUrl(channelFlowDetail, params));
}

// 起流程
export async function channelSaveFlowRq(params) {
  return request.post(channelSaveFlow, {
    body: params,
  });
}

// 渠道费用列表修改激活状态
export async function channelUpdateStateRq(params) {
  return request.post(toUrl(channelUpdateState, params));
}

// 渠道费用列表删除
export async function channelDelRq(params) {
  return request.delete(toUrl(channelDel, params));
}

// 渠道费用列表查询
export async function channelListRq(params) {
  return request.get(toUrl(channelList, params));
}

// 渠道费用新增/修改
export async function channelSaveRq(params) {
  return request.post(channelSave, {
    body: params,
  });
}

// =========================利益分配===================
// 第二节点多人审批通过
export async function benefitPassRq(params) {
  return request.post(benefitPass, {
    body: params,
  });
}

// 流程詳情
export async function benefitFlowDetailRq(params) {
  return request.get(toUrl(benefitFlowDetail, params));
}

// 起流程
export async function benefitSaveFlowRq(params) {
  return request.post(benefitSaveFlow, {
    body: params,
  });
}

// 利益分配修改激活状态
export async function benefitUpdateStatusRq(params) {
  return request.post(toUrl(benefitUpdateStatus, params));
}

// 利益分配删除
export async function benefitDelRq(params) {
  return request.delete(toUrl(benefitDel, params));
}

// 利益分配列表查询
export async function benefitListRq(params) {
  return request.get(toUrl(benefitList, params));
}

// 利益分配新增
export async function benefitSaveRq(params) {
  return request.post(benefitSave, {
    body: params,
  });
}
// =========================成本估算===================
// 第二节点多人审批通过
export async function costePassRq(params) {
  return request.post(costePass, {
    body: params,
  });
}

// 流程詳情
export async function saveFlowDetailRq(params) {
  return request.get(toUrl(saveFlowDetail, params));
}

// 起流程
export async function saveFlowRq(params) {
  return request.post(saveFlow, {
    body: params,
  });
}

// 成本估算列表
export async function costeListRq(params) {
  return request.get(toUrl(costeList, params));
}

// 成本估算列表删除
export async function costeDelRq(params) {
  return request.delete(toUrl(costeDel, params));
}

// 成本估算列表激活
export async function updateStatusRq(params) {
  return request.post(toUrl(updateStatus, params));
}

// 成本估算新增
export async function costeSaveRq(params) {
  return request.post(costeSave, {
    body: params,
  });
}

// 成本估算新增
export async function costeUpdateRq(params) {
  return request.post(costeUpdate, {
    body: params,
  });
}

// ===========================else=======================

// 查询列表
export async function findOppos(params) {
  return request.get(toQs(opportunities, params));
}

// 查询单条信息
export async function findOppoById(id) {
  return request.get(toUrl(opportunitie, { id }));
}

// 查询产品下拉
export async function selectProduct() {
  return request.get(productMultiColSelect);
}

// 查询客户多列下拉
export async function selectCust() {
  return request.get(custMultiColSelect);
}

// 新增
export async function create(params) {
  return request.post(opportunities, {
    body: params,
  });
}

// 编辑
export async function update(params) {
  return request.put(opportunities, {
    body: params,
  });
}

// 保存商机案例分析
export async function saveCases(params) {
  return request.post(oppoCaseSave, { body: params });
}
// 商机案例分析列表
export async function findCases(params) {
  return request.get(toQs(oppoCases, { oppoId: params.oppoId }));
}

// 保存竞争对手
export async function saveCompes(params) {
  return request.post(oppoCompeSave, { body: params });
}
// 竞争对手列表
export async function findCompes(params) {
  return request.get(toQs(oppoCompes, { oppoId: params.oppoId }));
}

// 保存额外销售费用
export async function saveOppoExtrafees(params) {
  return request.post(oppoExtrafeeSave, { body: params });
}
// 额外销售费用列表
export async function findOppoExtrafees(params) {
  return request.get(toQs(oppoExtrafees, { oppoId: params.oppoId }));
}

// 保存合作伙伴
export async function saveOppoPartners(params) {
  return request.post(oppoPartnerSave, { body: params });
}
// 合作伙伴列表
export async function findOppoPartners(params) {
  return request.get(toQs(oppoPartners, { oppoId: params.oppoId }));
}

// 保存销售清单
export async function saveOppoSales(params) {
  return request.post(oppoSaleSave, { body: params });
}
// 销售清单列表
export async function findOppoSales(params) {
  return request.get(toQs(oppoSalelists, { oppoId: params.oppoId }));
}

// 保存商机干系人
export async function saveOppoShs(params) {
  return request.post(oppoShSave, { body: params });
}
// 商机干系人列表
export async function findOppoShs(params) {
  return request.get(toQs(oppoShs, params));
}

// 关闭商机及原因
export async function closeOppo(params) {
  return request.post(toUrl(oppoCloseReason, { id: params.id, reason: params.reason }), {
    body: params,
  });
}

// 激活
export async function updateOppoActive(params) {
  return request.post(toUrl(oppoActive, { id: params.id }));
}

// 暂挂
export async function updateOppoPending(params) {
  return request.post(toUrl(oppoPending, { id: params.id }));
}

// 查询供应商多列下拉
export async function selectSupp() {
  return request.get(suppMultiColSelect);
}

// 编辑类别码
export async function updateCategory(params) {
  return request.put(oppoCategory, {
    body: params,
  });
}

// 重新打开已关闭的商机
export async function updateOppoOpen(params) {
  return request.get(toUrl(oppoOpen, params));
}
