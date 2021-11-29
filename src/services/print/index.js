import { fromQs } from '@/utils/stringUtils';
import { getLogs } from './flowLogs';
import { getExpenseNormalData } from './expenseeNormal';
import { getExpenseTripData } from './expenseTrip';
import { getExpenseSpecData } from './exspenseSpec';
import { getExpenseeFeeAppleData } from './expenseeFeeApple';
import { getExpenseTicketData } from './expenseTicket';
import { getPrintInvData } from './invSpec';
import { getAdPayData } from './adPay';
import { getTransferMoneyDetailData } from './transfermMoney';
import { getPaymentApplyData } from './paymentApply';
import { expenseClaimDetail, loanApplyDetail, otherPaymentDetail } from '@/services/production/cos';
import { tripManagementClaimDetail } from '@/services/production/adm/trip/tripApply';
import { pcontractDetailRq } from '@/services/workbench/contract';

import { paymentRequestDetail } from '@/services/production/pur';

export async function getPrintData() {
  const { scope, id, prcId } = fromQs();
  const { logList, ...flowInfo } = await getLogs({ scope, id, prcId });
  let formData = {};
  switch (scope) {
    case 'ACC_A13': {
      // 差旅
      formData = await getExpenseTripData(id);
      break;
    }
    case 'ACC_A12': {
      // 非差旅
      formData = await getExpenseNormalData(id);
      break;
    }
    case 'ACC_A25': {
      // 专项
      formData = await getExpenseSpecData(id);
      break;
    }
    case 'ACC_A27': {
      // 特殊
      formData = await getExpenseeFeeAppleData(id);
      break;
    }
    case 'ACC_A24': {
      // 因公行政订票
      formData = await getExpenseTicketData(id);
      break;
    }
    case 'printInv': {
      // 合同发票
      formData = await getPrintInvData(id);
      break;
    }
    case 'ACC_A29': {
      // 合同发票
      formData = await getAdPayData(id);
      break;
    }
    case 'ACC_A38': {
      // 提现付款
      formData = await getExpenseNormalData(id);
      break;
    }
    case 'ACC_A66': {
      formData = await getTransferMoneyDetailData(id);
      break;
    }
    // 协议
    case 'ACC_A81': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 预付款申请
    case 'ACC_A82': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 预付款核销
    case 'ACC_A83': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请
    case 'ACC_A80': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 薪资福利
    case 'ACC_A84': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 福利薪资结算
    case 'ACC_A87': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 投标保证金
    case 'ACC_A86': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:合同采购-服务贸易
    case 'ACC_A90': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:对公资源外包(提点)
    case 'ACC_A91': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:个体资源外包
    case 'ACC_A92': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:对公资源外包
    case 'ACC_A93': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:合同采购-产品贸易
    case 'ACC_A96': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:合同采购-渠道费用
    case 'ACC_A98': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:房屋租赁
    case 'ACC_A100': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:杂项采购
    case 'ACC_A101': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:市场渠道
    case 'ACC_A102': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:预付款核销
    case 'ACC_A103': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:研发采购
    case 'ACC_A104': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:行政运营类采购
    case 'ACC_A105': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:公司管理类
    case 'ACC_A107': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:资源赋能类采购
    case 'ACC_A108': {
      formData = await getPaymentApplyData(id);
      break;
    }
    // 付款申请单:预付款：预付款（产品贸易类）/预付款（服务贸易类）/预付款（其它）
    case 'ACC_A110': {
      formData = await getPaymentApplyData(id);
      break;
    }
    case 'COS_S01':
    case 'COS02':
    case 'COS03':
    case 'COS04':
    case 'COS05': {
      const res = await expenseClaimDetail({ id });
      if (res) {
        formData = res.response.data;
      }
      break;
    }
    case 'COS11': {
      const res = await loanApplyDetail({ id });
      if (res) {
        formData = res.response.data;
      }
      break;
    }
    case 'COS12': {
      const res = await otherPaymentDetail({ id });
      if (res) {
        formData = res.response.data;
      }
      break;
    }
    case 'ADM_M07': {
      const res = await tripManagementClaimDetail({ id });
      if (res) {
        formData = res.response.data;
      }
      break;
    }
    case 'ADM_M02': {
      const res = await pcontractDetailRq({ id });
      if (res) {
        formData = res.response.data;
      }
      break;
    }
    case 'PUR_G02':
    case 'PUR05': {
      const res = await paymentRequestDetail({ id });
      if (res) {
        formData = res.response.data;
      }
      break;
    }
    default:
      break;
  }

  const logListData = [];
  logList.forEach(v => {
    const obj = {
      ...v,
    };
    if (!v.remark || v.remark === 'undefined') {
      obj.remark = '';
    }
    if (v.result === 'APPLIED') {
      obj.resultDesc = '提交';
    } else if (v.result === 'APPROVED') {
      obj.resultDesc = '通过';
    } else if (v.result === 'REJECTED') {
      obj.resultDesc = '拒绝';
    } else if (v.result === 'ASSIGN') {
      obj.resultDesc = '分配';
    } else if (v.result === 'CLOSE') {
      obj.resultDesc = '关闭';
    } else if (v.result === 'ACCEPT') {
      obj.resultDesc = '接收';
    } else if (v.result === 'ROLLBACK') {
      obj.resultDesc = '撤回';
    } else {
      obj.resultDesc = '处理中';
    }
    logListData.push(obj);
  });

  const result = {
    formData: { ...flowInfo, ...formData },
    logList: logListData,
  };
  return Promise.resolve(result);
}
