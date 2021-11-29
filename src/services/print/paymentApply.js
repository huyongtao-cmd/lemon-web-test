import {
  getPaymentApplyById,
  selectAccountByNo,
} from '@/services/sale/purchaseContract/paymentApplyList';
import { fromQs } from '@/utils/stringUtils';
import { getFlowInfoByTaskInfo } from '@/services/gen/flow';

export async function getPaymentApplyData(id) {
  // 获取流程编号
  const params = fromQs();
  const respData = await getFlowInfoByTaskInfo({ docId: params.id, procDefKey: params.scope });
  let flowNo = '';
  if (respData.status === 200) {
    flowNo = respData.response.NO;
  }
  const { status, response } = await getPaymentApplyById(id);
  if (status === 200) {
    const { datum = {} } = response;
    const {
      twPaymentApplyEntity = {},
      // 费用承担部门
      twCostUndertakeDeptEntities = [],
      // 预付款核销
      twInvoiceVerDetailEntities = [],
      twPaymentSlipEntities = [],
      // 付款明细
      twPurchasePaymentPlanEntities = [],
      twWithdrawEntities,
    } = datum || {};
    const { paymentNo, paymentApplicationType, receivingUnit, receivingId } = twPaymentApplyEntity;
    const accountList = await selectAccountByNo(receivingUnit);
    const statusAcc = accountList.status;
    const responseAcc = accountList.response;
    const datumAcc = responseAcc.datum;
    if (statusAcc === 200 && receivingUnit && receivingId) {
      const currentAcc = datumAcc.find(item => item.id === parseInt(receivingId, 10)) || {};
      twPaymentApplyEntity.receivingBankAccount = currentAcc.name;
    }

    const isAdvance = paymentApplicationType === 'ADVANCEPAY'; // 是预付款;
    const isAdvancePayment = paymentApplicationType === 'ADVANCEPAYWRITEOFF'; // 是预付款核销;
    const isPayment =
      paymentApplicationType === 'CONTRACT' ||
      paymentApplicationType === 'AGREEMENT' ||
      paymentApplicationType === 'SALARYPAYMENT' ||
      paymentApplicationType === 'OTHERPAYMENT'; // 是付款;
    const haveWriteOff = isAdvancePayment || isPayment;
    const newTwCostUndertakeDeptEntities = twCostUndertakeDeptEntities.map((item, index) => {
      const newItem = Object.assign([], item);
      newItem.key = index + 1;
      return newItem;
    });
    const newTwPurchasePaymentPlanEntities = twPurchasePaymentPlanEntities.map((item, index) => {
      const newItem = Object.assign([], item);
      newItem.key = index + 1;
      return newItem;
    });
    const newTwInvoiceVerDetailEntities = twInvoiceVerDetailEntities.map((item, index) => {
      const newItem = Object.assign([], item);
      newItem.key = index + 1;
      return newItem;
    });
    const data = {
      flowNo,
      ...twPaymentApplyEntity,
      twPurchasePaymentPlanEntities: newTwPurchasePaymentPlanEntities || [],
      twInvoiceVerDetailEntities: newTwInvoiceVerDetailEntities || [],
      twCostUndertakeDeptEntities: newTwCostUndertakeDeptEntities || [],
      reimNo: paymentNo,
      isAdvance,
      isAdvancePayment,
      isPayment,
      haveWriteOff,
    };
    return data || {};
  }
  return {};
}
