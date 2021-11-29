import {
  selectInvInfo,
  detailInvInfo,
  saveInvBatch,
  saveInvBatchInfo,
  finishInvBatch,
  saveInvInput,
} from '@/services/plat/recv/Contract';
import {
  detailInvBatch,
  contractInvBatch,
  infoInvBatch,
  detailInvBatchList,
  detailRecvplanslList,
  rollbackContract,
  getAccountByInvId,
} from '@/services/plat/recv/InvBatch';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'invInput',
  state: {
    dtlList: [], // 具体发票信息
    delList: [], // 具体发票信息删除集合
    recvPlanList: [],
    recvData: {
      recvAmt: null,
      recvDate: null,
      remark: null,
      accountNo: null,
      ledgerDate: null,
    },
    formData: [],
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(detailInvBatchList, payload);
      const recvPlanListData = yield call(detailRecvplanslList, payload);
      // const dtlListData = yield call(infoInvBatch, payload);
      yield put({
        type: 'updateState',
        payload: {
          formData: response.datum || {},
          recvPlanList: Array.isArray(recvPlanListData.response.datum)
            ? recvPlanListData.response.datum
            : [],
          // dtlList: dtlListData.response.datum,
        },
      });
    },

    *save({ payload }, { call, put, select }) {
      const { status, response } = yield call(saveInvInput, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        // eslint-disable-next-line
        createMessage({ type: 'success', description: <pre>{response.reason}</pre> || '保存失败' });
        yield put({
          type: 'invBatchList/query',
        });
        closeThenGoto('/plat/saleRece/invBatch/list');
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },

    *rollbackItems({ payload }, { call, put, select }) {
      const { status, response } = yield call(rollbackContract, payload);
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '退回成功' });
          closeThenGoto('/plat/saleRece/invBatch/list');
        } else {
          createMessage({ type: 'error', description: response.reason });
        }
      }
    },
    *getAccountByInvId({ payload }, { call, put, select }) {
      const { status, response } = yield call(getAccountByInvId, payload);
      if (status === 200) {
        if (response.ok) {
          return response;
        }
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
    updateRecvData(state, { payload }) {
      const { recvData } = state;
      const newFormData = { ...recvData, ...payload };
      return {
        ...state,
        recvData: newFormData,
      };
    },
  },
};
