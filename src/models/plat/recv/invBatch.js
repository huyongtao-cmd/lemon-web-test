import {
  queryInvBatchList,
  rollbackContract,
  updateRecvAccount,
} from '@/services/plat/recv/InvBatch';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const defaultSearchForm = {
  // 批次号
  batchNo: null,
  // 批次状态
  batchStatus: null,
  // 发票号
  invNo: null,
  // 客户名称
  custName: null,
  // 主合同名称
  contractName: null,
  // 子合同号
  subContractNo: null,
  // 子合同名称
  subContractName: null,
  // 开票日期
  batchDateStart: null,
  batchDateEnd: null,
  // 发票抬头
  invTitle: null,
  // 预计收款日期
  expectRecvDateStart: null,
  expectRecvDateEnd: null,
  // 逾期天数
  overDays: null,
  // 开票主体
  ouId: null,
};

export default {
  namespace: 'invBatchList',
  state: {
    dataSource: [],
    dtlList: [], // 具体发票信息
    delList: [], // 具体发票信息删除集合
    searchForm: defaultSearchForm,

    formData: {
      // 开票基本信息
      // id - T_INV_BATCH.ID
      id: null,
      //  批次号 - T_INV_BATCH.BATCH_NO
      batchNo: null,
      //  批次状态 已申请/待开票/已开票/已取消 - T_INV_BATCH.BATCH_STATUS
      batchStatus: null,
      batchStatusDesc: null,
      //  发票信息ID - T_INV_BATCH.INVINFO_ID
      invinfoId: null,
      //  发票抬头 - T_INV_BATCH.INV_TITLE
      invTitle: null,
      //  发票类型 - T_INV_BATCH.INV_TYPE
      invType: null,
      invTypeDesc: null,
      //  税率 - T_INV_BATCH.TAX_RATE
      taxRate: null,
      //  递送方式 - T_INV_BATCH.DELI_METHOD
      deliMethod: null,
      deliMethodDesc: null,
      //  收件人 - T_INV_BATCH.CONTACT_PERSON
      contactPerson: null,
      //  收件人地址 - T_INV_BATCH.INV_ADDR
      invAddr: null,
      //  收件人电话 - T_INV_BATCH.INV_TEL
      invTel: null,
      //  开户行 - T_INV_BATCH.BANK_NAME
      bankName: null,
      //  收款账号 - T_INV_BATCH.ACCOUNT_NO
      accountNo: null,
      //  开票日期 - T_INV_BATCH.BATCH_DATE
      batchDate: null,
      //  发票内容 - T_INV_BATCH.INV_CONTENT
      invContent: null,
      //  付款方式 - T_INV_BATCH.PAY_METHOD
      payMethod: null,
      payMethodDesc: null,
      //  开票说明 - T_INV_BATCH.INV_DESC
      invDesc: null,
      //  备注 - T_INV_BATCH.REMARK
      remark: null,
      // 创建人
      createUserName: null,
      // 创建时间
      createTime: null,
      // 批次开票金额 （只读，始终等于“开票相关合同”中各行“未开票金额”合计）
      invAmt: null,
    },
    invId: null, // 补录收款信息 选择的开票记录id
    accountNo: null, // 补录收款信息 选择的银行账号
    ledgerDate: null, // 补录收款信息 选择的总账日期
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(queryInvBatchList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    *rollbackItems({ payload }, { call, put, select }) {
      const { status, response } = yield call(rollbackContract, payload);
      if (status === 200) {
        if (response.ok) {
          const { searchForm } = yield select(({ invBatchList }) => invBatchList);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          createMessage({ type: 'success', description: '退回成功' });
        } else {
          createMessage({ type: 'error', description: response.reason });
        }
      }
    },
    *updateRecvInfo({ payload }, { call, put, select }) {
      const { invId, accountNo } = yield select(({ invBatchList }) => invBatchList);
      let { ledgerDate } = yield select(({ invBatchList }) => invBatchList);
      if (!ledgerDate) {
        ledgerDate = moment().format('YYYY-MM-DD');
      } else {
        ledgerDate = ledgerDate.format('YYYY-MM-DD');
      }
      // 校验必填
      if (!invId) {
        createMessage({ type: 'warn', description: '请先选中一条记录' });
        return {};
      }
      if (!accountNo) {
        createMessage({ type: 'warn', description: '请选择银行账号' });
        return {};
      }
      if (!ledgerDate) {
        createMessage({ type: 'warn', description: '请选择总账日期' });
        return {};
      }
      // 保存数据
      const { status, response } = yield call(updateRecvAccount, { invId, accountNo, ledgerDate });
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState', // 清空state
            payload: {
              invId: null,
            },
          });
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败,' + response.reason });
        }
        return response;
      }
      return {};
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
  },
};
