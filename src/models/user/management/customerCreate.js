import {
  customerSaveRq,
  customerDetailsRq,
  seletePicByIdRq,
} from '@/services/user/management/customer';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { queryCascaderUdc } from '@/services/gen/app';
import { isEmpty, isNil } from 'ramda';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'customerCreate',
  state: {
    formData: {},
    cityList: [],
    resDataSource: [],
  },

  effects: {
    *save({ payload }, { call, put, select }) {
      const { formData } = yield select(({ customerCreate }) => customerCreate);
      const { status, response } = yield call(customerSaveRq, formData);
      if (status === 200) {
        if (response && response.ok) {
          if(payload){
            return createMessage({ type: 'success', description: '提交成功' });
          }
          createMessage({ type: 'success', description: '提交成功' });
          const { from } = fromQs();
          closeThenGoto(`${from}?saveEdit=true`);
        } else {
          createMessage({ type: 'warn', description: response.reason || '提交失败' });
        }
      }
    },
    *customerDetails({ payload }, { call, put }) {
      const { status, response } = yield call(customerDetailsRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          const detail = response.datum ? response.datum : {};
          yield put({
            type: 'updateForm',
            payload: {
              ...detail,
            },
          });

          const { provInce } = detail;
          yield put({
            type: 'handleChangeCity',
            payload: provInce,
          });
        } else {
          createMessage({ type: 'warn', description: response.reason || '获取详细信息失败' });
        }
      }
    },
    *seletePicById({ payload }, { call, put }) {
      const { status, response } = yield call(seletePicByIdRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              saleVp: response.datum,
            },
          });
        } else {
          createMessage({ type: 'warn', description: response.reason || '获取销售VP失败' });
        }
      }
    },
    // 根据省获取市
    *handleChangeCity({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:CITY',
        parentDefId: 'COM:PROVINCE',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { cityList: Array.isArray(response) ? response : [] },
        });
      }
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
          resDataSource: list,
        },
      });
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
