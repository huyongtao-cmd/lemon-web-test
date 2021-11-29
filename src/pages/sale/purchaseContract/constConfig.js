/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable array-callback-return */
/* eslint-disable radix */
/* eslint-disable prefer-const */
import createMessage from '@/components/core/AlertMessage';
import { add as mathAdd, sub } from '@/utils/mathUtils';

export const CONFIGSCENE = {
  '1': 'SERVICE_TRADE', // 合同采购服务贸易
  '2': 'PRODUCT_TRADE', // 产品贸易
  '3': 'TENDER_DEPOSIT', // 合同采购投标保证金(商机自动带到预付款申请页面)
  '4': 'CHANNEL_COSTS', // 渠道费用
  '5': 'INDIVIDUAL_PRE_SALE', // 个体售前资源外包
  '6': 'PUBLIC_SETTLEMENT', // 对公资源外包
  '7': 'PUBLIC_SETTLEMENT_POINT', // 对公资源外包(提点)
  '8': 'INDIVIDUAL_SETTLEMENT', // 个体资源外包
  '9': 'MARKETING', // 市场渠道
  '10': 'RD_PROCUREMENT', // 研发采购
  '11': 'ADMINISTRATIVE_PROC', // 行政运营类采购
  '12': 'MANAGEMENT', // 公司管理类
  '13': 'RESOURCE_EMPOWERMENT_PROC', // 资源赋能类采购
  '14': 'PRE_SALE', // 预付款编辑
  '15': 'WRITTENOFF', // 预付款核销
  '16': 'WELFARE', // 薪资福利结算单
  '17': 'SALARIES', // 薪资福利基于薪资成本
  '18': 'RENT', // 房屋租赁
  '19': 'SUNDRY', // 杂项采购
};

export const FLOW_NO = {
  CONTRACT: 'ACC_A80', // 合同
  AGREEMENT: 'ACC_A81', // 协议
  ADVANCEPAY: 'ACC_A82', // 预付款
  ADVANCEPAYWRITEOFF: 'ACC_A83', // 预付款核销
  SALARYPAYMENT: 'ACC_A84', // 薪资福利
  PAYRECORD: 'ACC_A85', // 付款记录
  '1': 'ACC_A90', // 付款申请单：合同采购-服务贸易
  '2': 'ACC_A96', // 付款申请单：合同采购-产品贸易
  '3': 'ACC_A86', // 付款申请单：合同采购投标保证金
  '4': 'ACC_A98', // 付款申请单：合同采购-渠道费用
  '6': 'ACC_A93', // 付款申请单：对公资源外包
  '7': 'ACC_A91', // 付款申请单：对公资源外包(提点)
  '8': 'ACC_A92', // 付款申请单：个体资源外包
  '9': 'ACC_A102', // 付款申请单：市场渠道
  '10': 'ACC_A104', // 付款申请单：研发采购
  '11': 'ACC_A105', // 付款申请单：行政运营类采购
  '12': 'ACC_A107', // 付款申请单：公司管理类
  '13': 'ACC_A108', // 付款申请单：资源赋能类采购
  '14': 'ACC_A110', // 付款申请单：预付款：预付款（产品贸易类）/预付款（服务贸易类）/预付款（其它）
  '15': 'ACC_A103', // 付款申请单：预付款核销
  '16': 'ACC_A87', // 付款申请单：福利薪资结算
  '18': 'ACC_A100', // 付款申请单：房屋租赁
  '19': 'ACC_A101', // 付款申请单：杂项采购

  // 采购合同(采购类型-业务类型)
  'PROJECT-RENT': 'TSK_S12', // 采购合同：项目采购-房屋租赁
  'PROJECT-SUNDRY': 'TSK_S13', // 采购合同：项目采购-杂项采购
  'CONTRACT-SERVICES_TRADE': 'TSK_S14', // 采购合同：合同采购-服务贸易
  'CONTRACT-PRODUCT_TRADE': 'TSK_S15', // 采购合同：合同采购-产品贸易
  'CONTRACT-CHANNEL_COST': 'TSK_S17', // 采购合同：合同采购-渠道费用
  MARKET: 'TSK_S18', // 采购合同：市场渠道
  RESEARCH: 'TSK_S19', // 采购合同：研发采购
  ADMINISTRATIVE: 'TSK_S20', // 采购合同：行政运营类采购
  MANAGEMENT: 'TSK_S21', // 采购合同：公司管理类
  RESOURCE: 'TSK_S22', // 采购合同：资源赋能类采购
};

export const ARRY_NO = [
  '1',
  '2',
  '3',
  '4',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '18',
  '19',
];

// 获取采购合同流程Key
export const getContractFlowNo = (purchaseType, businessType) => {
  let flowKey = '';
  if (purchaseType) {
    flowKey += purchaseType;
  }
  if (businessType && businessType !== 'BUSINESS_EMPTY') {
    flowKey += '-' + businessType;
  }
  const flowNo = FLOW_NO[flowKey] || '';
  console.warn('获取合同流程Key：', flowKey, flowNo);
  return flowNo;
};

// 获取付款申请单、预付款、预付款核销的合同流程Key
export const getPaymentFlowNo = ({ scene, paymentApplicationType }) => {
  let flowKey = '';
  if (scene && ARRY_NO.includes(scene)) {
    // 新流程都根据场景判断工作流Key
    flowKey = scene;
  } else if (paymentApplicationType) {
    // 兼容旧工作流，根据付款申请单类型判断工作流Key
    flowKey = paymentApplicationType;
  }
  const flowNo = FLOW_NO[flowKey] || '';
  console.warn('获取' + paymentApplicationType + '_' + scene + '流程Key：', flowKey, flowNo);
  return flowNo;
};

// 税率的结算
export const CalculateRate = newInvoice => {
  let rateString = '';
  let newRate = [];
  if (newInvoice.length === 0) return rateString;
  newInvoice.map((item, index) => {
    if (item.rate.indexOf('~') > -1) {
      let ArraySplit = item.rate.split('~');
      ArraySplit.map(_ => {
        let newString = parseInt(_.substring(0, _.length - 1));
        newRate.push(newString);
      });
    } else {
      newRate.push(parseInt(item.rate.substring(0, item.rate.length - 1)));
    }
  });
  const max = Math.max.apply(null, newRate);
  const min = Math.min.apply(null, newRate);
  if (max !== min) {
    rateString = `${min}%~${max}%`;
  } else {
    rateString = `${max}%`;
  }
  return rateString;
};

// 设置默认值
export const setDefaultFormData = (defaultFormData, queryFormData) => {
  for (let k in defaultFormData) {
    for (let t in queryFormData) {
      if (k === t && queryFormData[t] === null) {
        queryFormData[t] = defaultFormData[k];
      }
    }
  }
  return queryFormData;
};

export const checkAmt = (namespace, type = 'edit') => {
  const {
    pageConfig,
    formData,
    payRecordList,
    bearDepList,
    invoiceVerDetail,
    payDetailList,
    fieldsConfig,
  } = namespace;
  const { currPaymentAmt } = formData;
  let PaymentAmt = 0; // 付款记录总金额
  let invoiceAmt = 0; // 发票明细总金额
  let preAmt = 0; // 前置单据总金额
  let buAmt = 0; // 部门分摊总金额
  let checkPaymentAmtFlag = true;
  let checkInvoiceAmtFlag = true;
  let checkAmtFlag = true;
  let checkBuAmtFlag = true;
  // 付款记录核销总计
  if (payRecordList.length > 0) {
    payRecordList.map(item => {
      PaymentAmt = mathAdd(PaymentAmt, item.paymentAmt);
    });
  }

  // 发票本次核销总计
  if (invoiceVerDetail.length > 0) {
    invoiceVerDetail.map(item => {
      invoiceAmt = mathAdd(invoiceAmt, item.theAmt);
    });
  }

  // 部门分摊金额总计
  if (bearDepList.length > 0) {
    bearDepList.map(item => {
      buAmt = mathAdd(buAmt, item.paymentAmt);
    });
    buAmt = mathAdd(buAmt, formData.taxAmount || 0);
  }

  // 前置单据总金额
  if (formData.scene === '6' || formData.scene === '7' || formData.scene === '8') {
    preAmt = formData.amtRateTotal;
  } else {
    preAmt = formData.paymentAmt;
  }
  if (pageConfig) {
    if (pageConfig.pageBlockViews || pageConfig.pageBlockViews.length > 1) {
      const currentBlockConfig = pageConfig.pageBlockViews.filter(
        item => item.blockKey === 'OVERVIEW'
      )[0];
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });

      // 付款金额与发票核销金额一致check
      if (pageFieldJson.checkInvoiceAmt.fieldDefaultValue === 'YES') {
        if (currPaymentAmt === invoiceAmt) {
          checkInvoiceAmtFlag = true;
        } else {
          checkInvoiceAmtFlag = false;
          createMessage({ type: 'error', description: '付款金额应与发票核销金额一致' });
        }
      }

      if (type === 'detail') {
        if (fieldsConfig.taskKey && fieldsConfig.taskKey.indexOf('ACCOUNTANCY') !== -1) {
          // 付款金额与付款记录金额一致check
          if (pageFieldJson.checkPaymentAmt.fieldDefaultValue === 'YES') {
            if (currPaymentAmt === PaymentAmt) {
              checkPaymentAmtFlag = true;
            } else {
              checkPaymentAmtFlag = false;
              createMessage({ type: 'error', description: '付款金额应与付款记录金额一致' });
            }
          }
        }
      }

      // 付款金额与业务单据申请金额一致check
      if (pageFieldJson.checkAmt.fieldDefaultValue === 'YES') {
        if (currPaymentAmt === preAmt) {
          checkAmtFlag = true;
        } else {
          checkAmtFlag = false;
          createMessage({ type: 'error', description: '付款金额应与业务单据申请金额一致' });
        }
      } else if (pageFieldJson.checkAmt.fieldDefaultValue === 'MAX') {
        if (currPaymentAmt <= preAmt) {
          checkAmtFlag = true;
        } else {
          checkAmtFlag = false;
          createMessage({ type: 'error', description: '付款金额不得大于业务单据申请金额' });
        }
      }

      // 付款金额与BU分摊金额一致check
      if (pageFieldJson.checkBuAmt.fieldDefaultValue === 'YES') {
        if (currPaymentAmt === buAmt) {
          checkBuAmtFlag = true;
        } else {
          checkBuAmtFlag = false;
          createMessage({ type: 'error', description: ' 付款金额应与BU分摊金额一致' });
        }
      }
    }
  }
  return checkPaymentAmtFlag && checkInvoiceAmtFlag && checkAmtFlag && checkBuAmtFlag;
};
