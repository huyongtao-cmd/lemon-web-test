import { findFeeApplyById } from '@/services/user/feeapply/feeapply';
import { getViewConf } from '@/services/gen/flow';

const defaultFormData = {
  id: null,
  applyNo: null, // 申请单号
  applyName: null, // 申请单号名称
  applyResId: null, // 申请人
  applyBuId: null, // 申请人base bu
  applyBuName: null, // 申请人base bu
  usageType: null, // 用途类型
  feeCode: null, // 费用码
  applyType: null, // 是否项目相关
  reasonId: null, // 事由号
  custId: null, // 客户
  custNo: null, // 客户
  abName: null, // 客户
  expenseBuId: null, // 费用承担BU
  expenseBuNo: null, // 费用承担BU
  expenseBuName: null, // 费用承担BU
  sumBuId: null, // 费用归属BU
  sumBuNo: null, // 费用归属BU
  sumBuName: null, // 费用归属BU
  applyAmt: null, // 费用总额
  expectDate: null, // 费用预计使用日期
  applyDate: null, // 申请日期
  apprStatus: null, // 申请状态
  apprStatusName: null, // 申请状态
  remark: null, // 费用申请原因说明
};

export default {
  namespace: 'userFeeApplySpecDetail',

  state: {
    formData: {
      ...defaultFormData,
    },
    dataSource: [],
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findFeeApplyById, { id: payload.id });
      yield put({
        type: 'updateState',
        payload: {
          formData: response.datum || {},
          dataSource: (response.datum || {}).applyds,
        },
      });
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
