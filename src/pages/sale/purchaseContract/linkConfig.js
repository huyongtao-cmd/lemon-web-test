// 根据类型+ID，返回路由地址
export const routerCfg = {
  // 申请单类型
  'TSK:PAYMENT_APPLICATION_TYPE': {
    // 按照采购合同付款
    CONTRACT: ({ id, scene = '59' }) =>
      `/sale/purchaseContract/paymentApplyList/edit?mode=view&id=${id}&scene=${scene}`,
    // 按照采购协议付款
    AGREEMENT: ({ id, scene = '6' }) =>
      `/sale/purchaseContract/paymentApplyList/edit?mode=view&id=${id}&scene=${scene}`,
    // 预付款
    ADVANCEPAY: ({ id, scene = '3' }) =>
      `/sale/purchaseContract/prePaymentApply/edit?mode=view&id=${id}&scene=${scene}`,
    // 预付款核销
    ADVANCEPAYWRITEOFF: ({ id, scene = '15' }) =>
      `/sale/purchaseContract/prePayWriteOff/edit?mode=view&id=${id}&scene=${scene}`,
  },
  // 关联单据类型
  'TSK:DOC_TYPE': {
    // 采购合同
    CONTRACT: ({ id }) => `/sale/purchaseContract/Detail?from=list&id=${id}&pageMode=purchase`,
    // 采购协议
    AGREEMENT: ({ id }) => `/sale/purchaseContract/purchaseAgreementDetail?id=${id}`,
  },
  // 销售合同
  salesContract: ({ id }) => `/sale/contract/salesSubDetail?id=${id}`,
  // 项目
  project: ({ id }) => `/user/project/projectDetail?id=${id}`,
  // 任务包
  task: ({ id }) => `/user/task/view?id=${id}`,
  // 预付款申请单
  prePayment: ({ id, scene = '14' }) =>
    `/sale/purchaseContract/prePaymentApply/edit?mode=view&id=${id}&scene=${scene}`,
  // 商机
  opportunity: ({ id }) => `/sale/management/oppsdetail?id=${id}`,
};

export const udcArr = ['TSK:PAYMENT_APPLICATION_TYPE', 'TSK:DOC_TYPE'];

export const getLink = (code, type, params) => {
  let url = '';
  if (code && params && params.id && routerCfg[code]) {
    if (udcArr.includes(code)) {
      if (type && routerCfg[code][type]) {
        url = routerCfg[code][type](params);
      }
    } else {
      url = routerCfg[code](params);
    }
  }
  return url;
};
