import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  mainContractCreate,
  opportunitySelect,
  contractSelect,
  subContractSelect,
  customerSelect,
  finperiodSelect,
  buProductSelect,
  queryContract,
  queryBusinessInfo,
  editContract,
  querySubContract,
  createSubContract,
  purchaseContract,
  purchaseContractPagenation,
  supplierSelect,
  purchaseSupplier,
  purchaseBu,
  purchaseDetail,
  purchaseEdit,
  updateStatus,
  purchasePlan,
  purchasePlanPatch,
  listRemoveContact,
  resetProfitResults,
  checkCreateProj,
  purchaseActivity,
  purchaseClose,
  salesRegionBuSelect,
  selectRecvPlan,
  contractListDel,
  passAccount,
  getNormSettleByContId,
} = api.user.contract;
const { custMultiColSelect, userMultiColSelect } = api.user;
const { busSelect } = api.org;

// 查询泛用结算分配详情
export async function getNormSettleByContIdRq(params) {
  return request.get(toUrl(getNormSettleByContId, params));
}

// 泛用结算分配 - 过账操作
export async function passAccountRq(params) {
  return request.put(toUrl(passAccount, params));
}

export async function create(params) {
  return request(mainContractCreate, {
    method: 'POST',
    body: params,
  });
}

export async function createSaleSub(params) {
  return request(createSubContract, {
    method: 'POST',
    body: params,
  });
}

export async function selectOpportunity() {
  return request.get(opportunitySelect);
}

export async function selectCustomer() {
  return request.get(custMultiColSelect);
}

export async function selectCust() {
  return request.get(customerSelect);
}

export async function selectSupplier() {
  return request.get(supplierSelect);
}

export async function selectContract() {
  return request.get(contractSelect);
}

export async function selectSubContract() {
  return request.get(subContractSelect);
}

export async function recvPlanSelect(id) {
  return request.get(toUrl(selectRecvPlan, { id }));
}

export async function selectBuProduct() {
  return request.get(buProductSelect);
}

export async function selectFinperiod() {
  return request.get(finperiodSelect);
}

export async function selectUserMultiCol() {
  return request.get(userMultiColSelect);
}

export async function selectSalesRegionBuMultiCol() {
  return request.get(salesRegionBuSelect);
}

export async function selectBu(params) {
  return request.get(toUrl(busSelect, { params }));
}

export async function queryContractDetail(id) {
  return request.get(toUrl(queryContract, { id }));
}
// 根据子合同id获取商机信息  获取项目难度和项目重要度
export async function queryBusinessInfoUri(id) {
  return request.get(toUrl(queryBusinessInfo, { id }));
}

export async function queryContractList(params) {
  return request.get(toQs(editContract, params));
}

export async function queryPurchaseContractList(params) {
  return request.get(toQs(purchaseContract, params));
}

export async function queryPurchaseContractListPagenation(params) {
  return request.get(toQs(purchaseContractPagenation, params));
}

export async function saveEditContract(params) {
  return request(editContract, {
    method: 'PUT',
    body: params,
  });
}

export async function querySubContractList(id) {
  return request.get(toUrl(querySubContract, { mainId: id }));
}

export async function linkagePurchaseSupplier(supplierId) {
  return request.get(toUrl(purchaseSupplier, { supplierId }));
}

export async function linkagePurchaseBu(buId) {
  return request.get(toUrl(purchaseBu, { buId }));
}

export async function createPurchaseContract(params) {
  return request(purchaseContract, {
    method: 'POST',
    body: params,
  });
}

export async function queryPurchaseDetail(id) {
  return request.get(toUrl(purchaseDetail, { id }));
}

export async function editPurchase(params) {
  return request(purchaseEdit, {
    method: 'PUT',
    body: params,
  });
}

export async function updateContractStatus(params) {
  return request.patch(toUrl(updateStatus, { id: params.id, status: params.status }), {
    body: params,
  });
}

export async function queryPlanList(params) {
  return request.get(toQs(purchasePlan, params));
}

export async function payPlanPatchSave(params) {
  return request.post(purchasePlanPatch, {
    body: params,
  });
}

export async function removeContactList(ids) {
  return request(toUrl(listRemoveContact, ids), {
    method: 'PATCH',
  });
}

export async function resetProfitResult(ids) {
  return request(toUrl(resetProfitResults, ids), {
    method: 'POST',
  });
}

// 判断子合同是否能创建项目
export async function checkCreateProjById(id) {
  return request.get(toUrl(checkCreateProj, id));
}

// 采购合同激活
export async function activityPurchase(id) {
  return request.put(toUrl(purchaseActivity, id));
}

// 采购合同关闭
export async function closePurchase(params) {
  return request.put(toUrl(purchaseClose, { id: params.id, reason: params.reason }));
}
// 删除采购合同
export async function contractListDelRq(payload) {
  return request.patch(toUrl(contractListDel, payload));
}
