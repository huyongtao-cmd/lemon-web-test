import { isEmpty, clone } from 'ramda';
import {
  otherFeeRq,
  relatedSubRq,
  contractSalesRq,
  otherFeeDetilRq,
  otherFeeDeRq,
} from '@/services/user/Contract/Fee';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import { genFakeId } from '@/utils/mathUtils';

export default {
  namespace: 'Fee',

  state: {
    initialOtherFeeList: [],
    initialOtherFeeDetail: [],
    otherFeeList: [],
    otherFeeDetail: [],
    currentNo: '',
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(otherFeeRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            otherFeeList: response.datum,
            initialOtherFeeList: response.datum,
          },
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '获取相关费用失败',
        });
      }
    },

    *otherFeeDetilRq({ payload }, { call, put, select }) {
      const { id } = payload;
      const { status, response } = yield call(otherFeeDetilRq, id);
      const { currentNo } = yield select(({ Fee }) => Fee);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            otherFeeDetail: response.datum.length
              ? response.datum
              : [
                  {
                    payStage: null,
                    payMoney: null,
                    paymentProportion: null,
                    settleStatus: null,
                    settleDate: null,
                    settleBillsNo: null,
                    settleBillsType: null,
                    id: genFakeId(-1),
                    feeNo: currentNo,
                  },
                ],
            initialOtherFeeDetail: response.datum,
          },
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '获取相关费用支付明细失败',
        });
      }
    },

    *save({ payload }, { call, put, select }) {
      const { otherFeeList, initialOtherFeeList, otherFeeDetail } = yield select(({ Fee }) => Fee);
      const a = otherFeeList.map(item => item.id);
      const b = initialOtherFeeList.map(item => item.id);
      const idList = [];
      b.forEach(i => {
        if (!a.includes(i)) {
          idList.push(i);
        }
      });
      const pass = otherFeeList.every(item => item.feeType && item.reimStatus && item.reimExp);
      const detailsPass = otherFeeDetail.every(item => item.settleStatus && item.settleDate);
      if (pass && detailsPass) {
        const { status, response } = yield call(
          relatedSubRq,
          { data: otherFeeList, idList },
          payload
        );
        if (status === 200) {
          if (response && response.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            const { id } = fromQs();
            yield put({
              type: 'query',
              payload: { id },
            });
            yield put({
              type: 'userContractEditSub/updateState',
              payload: {
                flag5: 0, // reset dirty flag
              },
            });
          } else {
            createMessage({ type: 'warn', description: response.reason || '提交失败' });
          }
        }
      } else {
        createMessage({ type: 'warn', description: '请填写列表内所有必填项' });
      }
    },

    *saveDetails({ payload }, { call, put, select }) {
      const { otherFeeDetail, initialOtherFeeDetail } = yield select(({ Fee }) => Fee);
      const a = otherFeeDetail.map(item => item.id);
      const b = initialOtherFeeDetail.map(item => item.id);
      const idList = [];
      b.forEach(i => {
        if (!a.includes(i)) {
          idList.push(i);
        }
      });
      const pass = otherFeeDetail.every(item => item.settleStatus && item.settleDate);
      if (pass) {
        const newList = clone(otherFeeDetail);
        newList.forEach(item => {
          // eslint-disable-next-line no-param-reassign
          item.settleDate =
            item.settleDate &&
            (typeof item.settleDate === 'object'
              ? item.settleDate.toISOString().slice(0, 10)
              : item.settleDate);
        });
        const { status, response } = yield call(otherFeeDeRq, { data: newList, idList }, payload);
        if (status === 200) {
          if (response && response.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            const { id } = fromQs();
            yield put({
              type: 'otherFeeDetilRq',
              payload,
            });
            yield put({
              type: 'userContractEditSub/updateState',
              payload: {
                flag5: 0, // reset dirty flag
              },
            });
          } else {
            createMessage({ type: 'warn', description: response.reason || '提交失败' });
          }
        }
      } else {
        createMessage({ type: 'warn', description: '请填写列表内所有必填项' });
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
  },
};
