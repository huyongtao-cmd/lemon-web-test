import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  normSettleCancel,
  normSettleTransfer,
  normSettleLogicalDelete,
  normSettleDetail,
  normSettleListPaging,
  normSettleModify,
  normSettleCreate,
  ledgerSelectConditional,
  feeCodeSelectConditional,
  accSelectConditional,
  findType,
  list,
  equivalentInfo,
  sumTable,
  singleTable,
  settleType,
  common,
  commonSC,
  commonD,
  procStart,
  equivalentSC,
  checkLastEquivalentDate,
  queryLastCountDate,
  updateLastCountDate,
  freezeList,
  unfreezeCreate,
  inchargeUnfreezeCreate,
  unfreezeModify,
  unfreezeDetail,
  unfreezeListPaging,
  settleList,
  withdrawCreate,
  buWithdrawCreateUri,
  withdrawModify,
  withdrawDetail,
  withdrawListPaging,
  withdrawIds,
  getBuWithdrawSumUri,
  supplierSelectConditional,

  withdrawPayCreate,
  withdrawPayModify,
  withdrawPayDetail,
  withdrawPayListPaging,
  withdrawPayAutoFlow,
  withdrawPayLogicalDelete,
  withdrawPayDeleteFlow,

  buWithdrawPayCreateUri, // post 创建提现付款
  buWithdrawPayModifyUri, // put 修改提现付款
  buWithdrawPayDetailUri, // get 提现付款详情
  buWithdrawPayListPagingUri, // get 提现付款列表
  buWithdrawPayLogicalDeleteUri, // patch 提现付款 逻辑删除
  normSettleSubmit, // 提交
  checkTaskEqvaStl,
  closeTaskBySId,
} = api.user.equivalent;

export async function cancelNormSettle(param) {
  return request.put(toUrl(normSettleCancel, param));
}

export async function transferNormSettle(param) {
  return request.put(toUrl(normSettleTransfer, param));
}

export async function logicalDeleteNormSettle(param) {
  return request.patch(toQs(normSettleLogicalDelete, param));
}

export async function queryNormSettleDetail(param) {
  return request.get(toUrl(normSettleDetail, param));
}

export async function queryNormSettleListPaging(param) {
  return request.get(toQs(normSettleListPaging, param));
}

export async function modifyNormSettle(params) {
  return request.put(normSettleModify, {
    body: params,
  });
}

export async function createNormSettle(param) {
  return request.post(normSettleCreate, {
    body: param,
  });
}

export async function selectLedgerConditional(param) {
  return request.get(toQs(ledgerSelectConditional, param));
}

export async function selectFeeCodeConditional(param) {
  return request.get(toQs(feeCodeSelectConditional, param));
}
export async function selectAccConditional(param) {
  return request.get(toQs(accSelectConditional, param));
}

export async function getType(id) {
  return request.get(toUrl(findType, { id }));
}

export async function getList(params) {
  return request.get(toQs(list, params));
}

export async function getInfo(param) {
  return request.get(toQs(equivalentInfo, param));
}

export async function createEquivalent(param) {
  return request.post(equivalentInfo, {
    body: param,
  });
}
export async function saveCheckEqva(param) {
  return request.post(toUrl(equivalentSC, { procTaskId: param.procTaskId }), {
    body: param,
  });
}

export async function checkLastEquivalent(param) {
  return request.get(toUrl(checkLastEquivalentDate, { settlementDate: param }));
}

export async function getLastCountDate(param) {
  return request.get(toQs(queryLastCountDate, param));
}

export async function setLastCountDate(param) {
  return request.post(toUrl(updateLastCountDate, { lastSettlementDate: param }));
}

export async function getSumTable(param) {
  return request.get(toQs(sumTable, param));
}

export async function getSingleTable(param) {
  return request.get(toQs(singleTable, param));
}

export async function getSettleType() {
  return request.get(settleType);
}

export async function putCommon(params) {
  return request.put(common, {
    body: params,
  });
}
export async function putCommonSC(params) {
  return request.put(toUrl(commonSC, { procTaskId: params.procTaskId }), {
    body: params,
  });
}
export async function deleteCommon(ids) {
  return request.patch(commonD.replace(':ids', ids.join(',')));
}

export async function startProc(id) {
  return request.post(toUrl(procStart, { id }));
}

export async function findFreezeList(param) {
  return request.get(toQs(freezeList, param));
}

export async function createUnfreeze(param) {
  return request.post(unfreezeCreate, { body: param });
}
export async function createInchargeUnfreeze(param) {
  return request.post(inchargeUnfreezeCreate, { body: param });
}

export async function modifyUnfreeze(param) {
  return request.put(unfreezeModify, { body: param });
}

export async function queryUnfreezeDetail(param) {
  return request.get(toUrl(unfreezeDetail, param));
}

export async function queryUnfreezeListPaging(param) {
  return request.get(toQs(unfreezeListPaging, param));
}

export async function findSettleList(param) {
  return request.get(toQs(settleList, param));
}

export async function getBuWithdrawSum(param) {
  return request.get(toQs(getBuWithdrawSumUri, param));
}

export async function createWithdraw(param) {
  return request.post(withdrawCreate, { body: param });
}

export async function buWithdrawCreate(param) {
  return request.post(buWithdrawCreateUri, { body: param });
}

export async function modifyWithdraw(param) {
  return request.put(withdrawModify, { body: param });
}

export async function queryWithdrawDetail(param) {
  return request.get(toUrl(withdrawDetail, param));
}

export async function queryWithdrawListPaging(param) {
  return request.get(toQs(withdrawListPaging, param));
}

export async function queryWithdrawIds(param) {
  return request.get(toUrl(withdrawIds, param));
}

export async function selectSupplierConditional(param) {
  return request.get(toQs(supplierSelectConditional, param));
}

export async function createWithdrawPay(param) {
  return request.post(withdrawPayCreate, { body: param });
}

export async function modifyWithdrawPay(param) {
  return request.put(withdrawPayModify, { body: param });
}

export async function queryWithdrawPayDetail(param) {
  return request.get(toUrl(withdrawPayDetail, param));
}

export async function queryWithdrawPayListPaging(param) {
  return request.get(toQs(withdrawPayListPaging, param));
}

export async function handleWithdrawPayAutoFlow(param) {
  return request.get(toUrl(withdrawPayAutoFlow, param));
}

export async function logicalDeleteWithdrawPay(param) {
  return request.patch(toQs(withdrawPayLogicalDelete, param));
}

export async function handleWithdrawPayDeleteFlow(param) {
  return request.get(toUrl(withdrawPayDeleteFlow, param));
}

// bu提现付款
export async function buWithdrawPayCreate(param) {
  return request.post(buWithdrawPayCreateUri, { body: param });
}
export async function buWithdrawPayModify(param) {
  return request.put(buWithdrawPayModifyUri, { body: param });
}
export async function buWithdrawPayDetail(param) {
  return request.get(toUrl(buWithdrawPayDetailUri, param));
}
export async function buWithdrawPayListPaging(param) {
  return request.get(toQs(buWithdrawPayListPagingUri, param));
}
export async function buWithdrawPayLogicalDelete(param) {
  return request.patch(toQs(buWithdrawPayLogicalDeleteUri, param));
}
export async function submitNormSettle(param) {
  return request.put(normSettleSubmit, {
    body: param,
  });
}
export async function checkTaskEqva(id) {
  return request.get(toUrl(checkTaskEqvaStl, { id }));
}

export async function closeTaskByStlId(id) {
  return request.patch(toUrl(closeTaskBySId, { id }));
}
