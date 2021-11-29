import {
  modifyNormSettle,
  createNormSettle,
  queryNormSettleDetail,
  transferNormSettle,
  selectFeeCodeConditional,
  selectAccConditional,
  submitNormSettle,
} from '@/services/user/equivalent/equivalent';
import { selectSubContract } from '@/services/user/Contract/sales';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '../../../utils/stringUtils';

const UNFINISHED = 'NONE|IN PROCESS';

export default {
  namespace: 'generalAmtSettleCreate',
  state: {
    formData: {
      busiType: undefined,
    },
    recvPlanList: [],
    projectList: [],
    buLedgerList: [],
    projLedgerList: [],
    outFeeCodeList: [],
    inFeeCodeList: [],
    projectDisableFlag: false,
    outAccList: [],
    inAccList: [],
  },
  effects: {
    *transfer({ payload }, { call, put }) {
      const response = yield call(transferNormSettle, payload);
      if (response.response && response.response.ok) {
        // 保存成功
        createMessage({ type: 'success', description: '操作成功' });
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '操作失败' });
      }
    },

    *initOutFeeCodeUdcs({ payload }, { call, put, select }) {
      const { formData } = yield select(({ generalAmtSettleCreate }) => generalAmtSettleCreate);
      const { status, response } = yield call(selectFeeCodeConditional, {
        type: formData.outAccountType,
        id: formData.outAuId,
      });
      yield put({
        type: `updateState`,
        payload: { outFeeCodeList: response.map(fee => ({ ...fee, id: fee.code })) },
      });
    },
    *initInFeeCodeUdcs({ payload }, { call, put, select }) {
      const { formData } = yield select(({ generalAmtSettleCreate }) => generalAmtSettleCreate);
      const { status, response } = yield call(selectFeeCodeConditional, {
        type: formData.inAccountType,
        id: formData.inAuId,
      });
      yield put({
        type: `updateState`,
        payload: { inFeeCodeList: response.map(fee => ({ ...fee, id: fee.code })) },
      });
    },
    *initOutAccUdcs({ payload }, { call, put, select }) {
      const { formData } = yield select(({ generalAmtSettleCreate }) => generalAmtSettleCreate);
      const { status, response } = yield call(selectAccConditional, {
        type: formData.outAccountType,
        id: formData.outAuId,
        feeCode: formData.outFeeCode,
      });
      yield put({
        type: `updateState`,
        payload: { outAccList: response },
      });
    },
    *initInAccUdcs({ payload }, { call, put, select }) {
      const { formData } = yield select(({ generalAmtSettleCreate }) => generalAmtSettleCreate);
      const { status, response } = yield call(selectAccConditional, {
        type: formData.inAccountType,
        id: formData.inAuId,
        feeCode: formData.inFeeCode,
      });
      yield put({
        type: `updateState`,
        payload: { inAccList: response },
      });
    },

    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(queryNormSettleDetail, payload);
      if (status === 200) {
        // 初始化下拉框
        yield put({
          type: 'updateState',
          payload: {
            formData: response || {},
          },
        });
        yield put({
          type: 'initOutFeeCodeUdcs',
          payload: {},
        });
        yield put({
          type: 'initInFeeCodeUdcs',
          payload: {},
        });
        yield put({
          type: 'initOutAccUdcs',
          payload: {},
        });
        yield put({
          type: 'initInAccUdcs',
          payload: {},
        });
      }
    },
    *querySubContractList({ payload }, { call, put }) {
      const response = yield call(selectSubContract);
      const contractList = response.response;
      if (Array.isArray(contractList)) {
        yield put({
          type: 'updateState',
          payload: {
            contractList,
            contractSource: contractList,
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        // 修改
        if (payload.settleStatus !== 'CREATE') {
          createMessage({ type: 'warn', description: '只有新增状态的可以修改！' });
          return;
        }
        response = yield call(modifyNormSettle, payload);
      } else {
        // 新增
        response = yield call(createNormSettle, payload);
      }
      if (response.response && response.response.ok) {
        // 保存成功
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'updateState',
          payload: { formData: response.response.datum },
        });
        closeThenGoto(`/plat/intelStl/generalAmtSettle`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
      }
    },

    *submit({ payload }, { call, put }) {
      const { apprId: procTaskId, remark: procRemark } = fromQs();
      const response = yield call(submitNormSettle, { ...payload, procTaskId, procRemark });
      if (response.response && response.response.ok) {
        // 保存成功
        createMessage({ type: 'success', description: '提交成功' });
        yield put({
          type: 'updateState',
          payload: { formData: response.response.datum },
        });
        closeThenGoto(`/plat/intelStl/generalAmtSettle`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '提交失败' });
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
      };
    },
  },
};
