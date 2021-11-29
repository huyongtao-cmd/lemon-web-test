import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const { purchaseContract } = api.sale;

// 保存
export async function purchaseSave(params) {
  return request.post(purchaseContract.purchaseSave, {
    body: params,
  });
}
// 提交
export async function purchaseSubmit(params) {
  return request.post(purchaseContract.purchaseSubmit, {
    body: params,
  });
}
// 查询
export async function purchaseDetail(params) {
  return request.get(
    toUrl(purchaseContract.purchaseDetail, {
      key: params,
    })
  );
}

// 列表
export async function purchaseList(params) {
  return request.get(toQs(purchaseContract.purchaseList, params));
}

// 修改回显
export async function purchaseEdit(params) {
  return request.get(
    toUrl(purchaseContract.purchaseEdit, {
      key: params,
    })
  );
}

// 暂挂
export async function purchasePending(params) {
  return request.post(
    toUrl(purchaseContract.purchasePending, {
      id: params,
    })
  );
}

// 激活
export async function purchaseActive(params) {
  return request.post(
    toUrl(purchaseContract.purchaseActive, {
      id: params,
    })
  );
}

// 变更提交
export async function purchaseChangeSubmit(params) {
  return request.post(purchaseContract.purchaseChangeSubmit, {
    body: params,
  });
}

// 变更查询，通过采购合同id
export async function purchaseChangeBypurchaseId(params) {
  return request.get(
    toUrl(purchaseContract.purchaseChangeBypurchaseId, {
      id: params,
    })
  );
}

// 变更查询，通过变更流程id
export async function purchaseChangeBypurChangeId(params) {
  return request.get(
    toUrl(purchaseContract.purchaseChangeBypurChangeId, {
      id: params,
    })
  );
}

// 变更详情查询， 通过变更流程id
export async function purchaseChangeDetailByChangeId(params) {
  return request.get(
    toUrl(purchaseContract.purchaseChangeDetailByChangeId, {
      id: params,
    })
  );
}

// 终止提交
export async function purchaseOverSubmit(params) {
  return request.post(purchaseContract.purchaseOverSubmit, {
    body: params,
  });
}

// 变更查询，通过变更流程id
export async function purchaseOverByOverId(params) {
  return request.get(
    toUrl(purchaseContract.purchaseOverByOverId, {
      id: params,
    })
  );
}

// 变更详情查询， 通过变更流程id
export async function purchaseOverDetailByOverId(params) {
  return request.get(
    toUrl(purchaseContract.purchaseOverDetailByOverId, {
      id: params,
    })
  );
}

// 删除
export async function remove(params) {
  return request.patch(toUrl(purchaseContract.remove, params));
}

// 获取合同里程碑
export async function purchaseContractMilestone(params) {
  return request.get(toQs(purchaseContract.purchaseContractMilestone, params));
}

// 获取合同节点
export async function purchaseContractNode(params) {
  return request.get(toQs(purchaseContract.purchaseContractNode, params));
}

// 查询公司
export async function selectOuByOuId(params) {
  return request.get(toUrl(purchaseContract.selectOuByOuId, { id: params }));
}

// 查询任务包
export async function selectPackage(params) {
  return request.get(purchaseContract.selectPackage);
}

// 查询项目，通过任务包
export async function selectProjectByTaskId(params) {
  return request.get(toUrl(purchaseContract.selectProjectByTaskId, { id: params }));
}
