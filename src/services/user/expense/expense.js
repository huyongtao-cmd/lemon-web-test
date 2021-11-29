import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { queryUdc } from '@/services/gen/app';

const {
  expenses,
  myexpenses,
  expense,
  expenseSave,
  businessTrip,
  unBusinessTrip,
  projectSelect,
  buTaskSelect,
  preSaleTaskSelect,
  contractSelect,
  reimType2Select,
  reimType2SelectTrip,
  reimType2SelectSpecial,
  feeCodeSelect,
  accountSelect,
  accountAllSelect,
  payplanSelect,
  reimTmplGet,
  projectExpenseBu,
  taskExpenseBu,
  contractExpenseBu,
  buSelect,
  tripApply,
  accountList,
  payList,
  getMealFee,

  adjustedAmtSave,
  expenseApproved,
  expenseRejected,

  specInit,
  specCreate,
  specUpdate,

  particularPost,
  particularPut,
  particularApply,
  particularThreshold,
  particularApplyAvailable,

  expenseGetProcConf,

  expensePeriodCheck,
  taxList,
  reimNameList,
  updateCost,
  costrushUpload,

  expensesBatch,
  expensesBatchApproved,
  expensesBatchRejected,
  startWithdrawPayFlow,
  modifyWithdrawPayFlowUri,
  projectBudgetCheck,
  saveAccountJde,
  savePayJde,
  changeLeadsStatus,
  updateProblemTypeDesc,
  discountReim,
  getExpenseDetail,
  invoiceVerify,
  selectRoleCodeByResId,
} = api.user.expense;
const { doTask } = api.bpm;
const { deleteExpense } = api.user.center;

// 获取报销资源角色
export async function selectRoleCodeByResIdRq(params) {
  return request.get(toUrl(selectRoleCodeByResId, params));
}

// 报销单扫码获取报销单详情
export async function getExpenseDetailRq(params) {
  return request.get(toUrl(getExpenseDetail, params));
}

export async function changeLeads(payload) {
  return request.patch(toUrl(changeLeadsStatus, payload));
}

// 查询报销列表
export async function queryExpenses(params) {
  const temp = {};
  Object.keys(params).forEach(key => {
    if (params[key]) {
      temp[key] = params[key];
    }
  });
  return request.get(toQs(expenses, temp));
}

// 查询报销列表
export async function queryMyExpenses(params) {
  const temp = {};
  Object.keys(params).forEach(key => {
    if (params[key]) {
      temp[key] = params[key];
    }
  });
  return request.get(toQs(myexpenses, temp));
}

// 查询单条报销
export async function findExpenseById(id) {
  return request.get(expense.replace('{id}', id));
}

// 费用报销(财务记账、财务出纳付款  批量审批)
export async function approved(param) {
  return request.post(expenseApproved.replace(':ids', param.ids).replace(':type', param.type));
}

// 费用报销(财务记账、财务出纳付款  批量拒绝)
export async function rejected(param) {
  return request.post(expenseRejected.replace(':ids', param.ids).replace(':type', param.type), {
    body: { branch: param.branch },
  });
}

// 费用报销(非差旅) -- 新增
export async function createNormal(data) {
  return request.post(unBusinessTrip, { body: data });
}

// 费用报销(差旅) -- 新增
export async function createTrip(data) {
  return request.post(businessTrip, { body: data });
}

// 专项报销 -- 新增 非差旅
export async function createSpec(data) {
  return request.post(specCreate, { body: data });
}

// 专项报销 -- 更新 非差旅
export async function saveExpenseSpec(params) {
  return request.put(specUpdate, { body: params });
}

// 保存报销
export async function saveExpense(params) {
  return request.put(expenseSave, {
    body: params,
  });
}

// 报销类型2 UDC -- 非差旅
export async function selectReimType2(parentVal) {
  return request.get(toQs(reimType2Select, { parentVal }));
}

// 报销类型2 UDC -- 差旅
export async function selectReimType2Trip(parentVal) {
  return request.get(toQs(reimType2SelectTrip, { parentVal }));
}

// 报销类型2 UDC -- 特殊
export async function selectReimType2Special(parentVal) {
  return request.get(toQs(reimType2SelectSpecial, { parentVal }));
}

export async function selectReimType() {
  let type1List = await queryUdc('ACC:REIM_TYPE1');
  let type3List = await queryUdc('ACC:REIM_TYPE3');
  type1List = (Array.isArray(type1List.response) ? type1List.response : []).map(r => ({
    label: r.name,
    value: r.code,
    isLeaf: false,
  }));
  type3List = (Array.isArray(type3List.response) ? type3List.response : []).map(r => ({
    label: r.name,
    value: r.code,
  }));
  let type2List = [];
  return Promise.all(type1List.map((r, index) => selectReimType2(r.value))).then(type2 => {
    type2List = type2.map(t => (Array.isArray(t.response) ? t.response : []));

    type1List.forEach((type1, i) => {
      // eslint-disable-next-line no-param-reassign
      type1.children = type2List[i].map(r => ({ label: r.name, value: r.code, isLeaf: true }));
    });
    // console.log(type1List, type2List);
    return [type1List, type3List];
  });
  // return request.get(toQs(reimType2Select));
}

export async function selectReimTypeTrip() {
  let type1List = await queryUdc('ACC:REIM_TYPE1');
  let type3List = await queryUdc('ACC:REIM_TYPE3');
  type1List = (Array.isArray(type1List.response) ? type1List.response : []).map(r => ({
    label: r.name,
    value: r.code,
    isLeaf: false,
  }));
  type3List = (Array.isArray(type3List.response) ? type3List.response : []).map(r => ({
    label: r.name,
    value: r.code,
  }));
  let type2List = [];
  return Promise.all(type1List.map((r, index) => selectReimType2Trip(r.value))).then(type2 => {
    type2List = type2.map(t => (Array.isArray(t.response) ? t.response : []));

    type1List.forEach((type1, i) => {
      // eslint-disable-next-line no-param-reassign
      type1.children = type2List[i].map(r => ({ label: r.name, value: r.code, isLeaf: true }));
    });
    // console.log(type1List, type2List);
    return [type1List, type3List];
  });
  // return request.get(toQs(reimType2Select));
}

export async function selectReimTypeSpecial() {
  let type1List = await queryUdc('ACC:REIM_TYPE1');
  let type3List = await queryUdc('ACC:REIM_TYPE3');
  type1List = (Array.isArray(type1List.response) ? type1List.response : []).map(r => ({
    label: r.name,
    value: r.code,
    isLeaf: false,
  }));
  type3List = (Array.isArray(type3List.response) ? type3List.response : []).map(r => ({
    label: r.name,
    value: r.code,
  }));
  let type2List = [];
  return Promise.all(type1List.map((r, index) => selectReimType2Special(r.value))).then(type2 => {
    type2List = type2.map(t => (Array.isArray(t.response) ? t.response : []));

    type1List.forEach((type1, i) => {
      // eslint-disable-next-line no-param-reassign
      type1.children = type2List[i].map(r => ({ label: r.name, value: r.code, isLeaf: true }));
    });
    // console.log(type1List, type2List);
    return [type1List, type3List];
  });
  // return request.get(toQs(reimType2Select));
}

// 非差旅费用报销事由号 -- 项目下拉
export async function selectProject(resId) {
  return request.get(projectSelect.replace('{resId}', resId));
}

// 非差旅费用报销事由号 -- bu任务包下拉
export async function selectBuTask(resId) {
  return request.get(buTaskSelect.replace('{resId}', resId));
}

// 非差旅费用报销事由号 -- 售前任务包下拉
export async function selectPreSaleTask(resId) {
  return request.get(preSaleTaskSelect.replace('{resId}', resId));
}

// 非差旅费用报销事由号 -- 采购合同下拉
export async function selectContract(resId) {
  return request.get(contractSelect.replace('{resId}', resId));
}

// 差旅费用报销 -- 费用码下拉
export async function selectFeeCode(reasonType, reasonId) {
  return request.get(toQs(feeCodeSelect.replace('{reasonType}', reasonType), { id: reasonId }));
}

// 账户明细 -- 收款账号下拉
export async function selectAccount(resId = '', supplierId = '') {
  return request.get(toQs(accountSelect, { resId, supplierId }));
}

// 账户明细 -- 因公报销 所有对公账户
export async function selectAllAccount() {
  return request.get(accountAllSelect);
}

// 账户明细 -- 选择付款阶段
export async function selectPayPlan(contractId) {
  return request.get(payplanSelect.replace('{contractId}', contractId));
}

// 账户明细 -- 获取模版信息
// reimType1 reimType2 reimType3 legalOuId
export async function getReimTmpl(params) {
  return request.get(toQs(reimTmplGet, { ...params }));
}

// 账户明细 -- 事由号
export async function getBuByReasonId(type, reasonId) {
  switch (type) {
    case '01': {
      return request.get(projectExpenseBu + '?projId=' + reasonId);
    }
    case '04': {
      return request.get(contractExpenseBu + '?contractId=' + reasonId);
    }
    default: {
      return request.get(taskExpenseBu + '?taskId=' + reasonId);
    }
  }
}

// 差旅费用报销 -- 出差申请单下拉
export async function selectTripApply(resId, id, reimType1) {
  return request.get(toQs(tripApply, { resId, id, reimType1 }));
}

export async function selectBu() {
  return request.get(buSelect);
}

// 更新调整后金额 [{ id, reimId, adjustedAmt }]
export async function updateAdjustedAmt(reimId, params) {
  return request.patch(adjustedAmtSave.replace('{id}', reimId), {
    body: params,
  });
}

// 再次提交行政订票报销流程
export async function commitExpense(params) {
  return request.post(toUrl(doTask, { id: params.apprId }), {
    body: { result: 'APPROVED', remark: params.remark },
  });
}

export async function initSpecByResId(resId) {
  return request.get(toUrl(specInit, { resId }));
}

export async function deleteExpenses(ids) {
  return request.patch(deleteExpense.replace('{ids}', ids));
}

// 特殊费用报销新增 submitted 创建工作流
export async function postParticular(params) {
  return request.post(particularPost, {
    body: params,
  });
}

// 特殊费用报销更新 submitted 创建工作流
export async function putParticular(params) {
  return request.put(particularPut, {
    body: params,
  });
}

export async function getApplysByResId(applyRes) {
  return request.get(toQs(particularApply, { applyRes }));
}

export async function getFeeApplyThreshold() {
  return request.get(particularThreshold);
}

export async function getAvailableFeeApply(feeApplyId) {
  return request.get(toUrl(particularApplyAvailable, { feeApplyId }));
}

// 拉取特定的流程配置
export async function getProcConf() {
  return request.get(expenseGetProcConf);
}

// 查询记账导出列表
export async function queryExpenseAccount(params) {
  return request.get(toQs(accountList, params));
}
// 查询付款导出列表
export async function queryExpensePay(params) {
  return request.get(toQs(payList, params));
}

// 在“财务记账”节点点击审批通过时，判断当前系统日期在财务期间表（T_FIN_PERIOD）是否能取到期间值，如果没取到，报check error“当前日期的财务期间未维护，请联系系统管理员”
export async function checkExpensePeriod(date) {
  return request.get(toUrl(expensePeriodCheck, { date }));
}

// 进项税查询列表
export async function taxListRq(params) {
  return request.get(toQs(taxList, params));
}

// 进项税查询列表
export async function reimNameListRq() {
  return request.get(reimNameList);
}

// 进项税抵扣
export async function updateCostRq(params) {
  const { ids, dedResId } = params;
  return request.put(toQs(toUrl(updateCost, { ids }), { dedResId }));
}

// 进项税自动抵扣
export async function costrushUploadRq(params) {
  return request.post(costrushUpload, {
    body: params,
  });
}

// 查询批量报销列表
export async function queryExpensesBatch(params) {
  const temp = {};
  Object.keys(params).forEach(key => {
    if (params[key]) {
      temp[key] = params[key];
    }
  });
  return request.get(toQs(expensesBatch, temp));
}

// 财务负责人批量通过
export async function approvedBatch(ids) {
  return request.post(toUrl(expensesBatchApproved, { ids }));
}

// 财务负责人批量退回
export async function rejectedBatch(param) {
  return request.post(toUrl(expensesBatchRejected, { ids: param.ids }), {
    body: { branch: param.branch },
  });
}

// 进项税查询列表
export async function getMealFeeRq(params) {
  return request.get(toQs(getMealFee, params));
}

// 开始提现付款流程
export async function startWithdrawPay(params) {
  return request.get(toUrl(startWithdrawPayFlow, params));
}

// 修改提现付款流程
export async function modifyWithdrawPayFlow(params) {
  return request.put(modifyWithdrawPayFlowUri, { body: params });
}

// 业务负责人审批节点，审批通过前，先校验预算是否足够
export async function checkProjectBudget(params) {
  // todo 预算完成后开发此功能 20191119
  return request.put(projectBudgetCheck, { body: params });
  // return { status: 200, response: { ok: true } };
}

// 保存报销记账数据，用于jde数据同步，保存加修改
export async function saveAccount({ accPayBatchIds, jdeAccount }) {
  return request.post(toUrl(saveAccountJde, { accPayBatchIds }), { body: jdeAccount });
}

// 保存报销付款数据，用于jde数据同步，保存加修改
export async function savePay({ accPayBatchIds, jdePay }) {
  return request.post(toUrl(savePayJde, { accPayBatchIds }), { body: jdePay });
}
// 更新问题类型
export async function updateProblemType(params) {
  return request.patch(toUrl(updateProblemTypeDesc, { id: params.id }), {
    body: params,
  });
}

export async function discount(params) {
  const { discountReimIds: reimIds, discountNum } = params;
  return request.patch(toUrl(discountReim, { reimIds, discountNum }));
}

export async function handleInvoiceVerify(param) {
  return request.post(toUrl(invoiceVerify, { resId: param.reimResId }), {
    body: param.detailList, // param.detailList
  });
}
