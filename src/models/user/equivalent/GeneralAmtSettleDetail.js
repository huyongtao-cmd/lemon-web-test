import {
  queryNormSettleDetail,
  transferNormSettle,
  cancelNormSettle,
} from '@/services/user/equivalent/equivalent';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';

export default {
  namespace: 'generalAmtSettleDetail',
  state: {
    formData: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },
  effects: {
    *transfer({ payload }, { call, put }) {
      const response = yield call(transferNormSettle, payload);
      if (response.response && response.response.ok) {
        // 保存成功
        createMessage({ type: 'success', description: '操作成功' });
        const param = fromQs();
        yield put({
          type: 'queryDetail',
          payload: { id: param.id },
        });
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '操作失败' });
      }
    },

    // 取消过账
    *cancel({ payload }, { call, put }) {
      const response = yield call(cancelNormSettle, payload);
      if (response.response && response.response.ok) {
        // 保存成功
        createMessage({ type: 'success', description: '操作成功' });
        const param = fromQs();
        yield put({
          type: 'queryDetail',
          payload: { id: param.id },
        });
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '操作失败' });
      }
    },

    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(queryNormSettleDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response || {},
          },
        });
      }
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
