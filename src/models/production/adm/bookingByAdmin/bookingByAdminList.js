// 产品化引用
import { commonModelReducers } from '@/utils/production/modelUtils';
// service方法

// 默认状态
const defaultState = {
  selectedRows: [
    {
      supplierId: '',
      supplierName: '',
      chargeProjectId: '',
      tripExpenseId: '',
      chargeBuId: '',
      chargeCompany: '',
      originalCurrency: '',
      poName: '',
      paymentStage: '',
      poId: '',
      budgetItemId: '',
    },
  ],
  baseCurrencyBookTotalAmt: 0,
};

export default {
  namespace: 'bookingByAdminList',

  state: defaultState,

  // 异步方法
  effects: {},

  // 同步方法
  reducers: {
    // 使用工具方法快速写updateState,updateForm,cleanState 方法
    ...commonModelReducers(defaultState),
  },
};
