import {
  updateAccountFn,
  saveAccountFn,
  getaccountInfoById,
} from '@/services/sale/purchaseContract/salaryAccount';
import {
  selectAccountByNo,
  selectApplyAccounts,
} from '@/services/sale/purchaseContract/paymentApplyList';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { selectAbOus } from '@/services/gen/list';

import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'salaryAccountEdit',
  state: {
    formData: {},
    paymentOuList: [],
    collectionList: [],
  },

  effects: {
    *getDetails({ payload }, { call, put }) {
      const { status, response } = yield call(getaccountInfoById, payload);
      if (status === 200) {
        const { datum, ok } = response;
        yield put({
          type: 'updateState',
          payload: {
            formData: datum || {},
          },
        });
        const responseOus = yield call(selectAbOus, payload) || {};
        const ousData = responseOus.response || [];
        const { paymentOuId, collectionAbId } = datum;
        let relatedCode = null;
        let collectionCode = null;
        if (paymentOuId) {
          relatedCode = ousData.find(item => Number(item.id) === Number(paymentOuId)).code;
        }
        if (collectionAbId) {
          collectionCode = ousData.find(item => Number(item.valSphd1) === Number(collectionAbId))
            .code;
        }

        if (relatedCode) {
          yield put({
            type: 'selectAccountByNo',
            payload: {
              val: relatedCode,
              type: 'paymentOu',
            },
          });
        }
        if (collectionCode) {
          yield put({
            type: 'selectAccountByNo',
            payload: {
              val: collectionCode,
              type: 'collection',
            },
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },

    *save({ payload }, { call, put }) {
      const { id } = payload;
      const api = id ? updateAccountFn : saveAccountFn;
      const { status, response } = yield call(api, payload);
      if (status === 200) {
        const { datum, ok } = response;
        if (ok) {
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(
            '/sale/purchaseContract/purchaseSalaryAccount?refresh=purchaseSalaryAccount'
          );
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },

    // 银行卡号
    *selectAccountByNo({ payload }, { call, select, put, all }) {
      const { val, type } = payload;
      const { status, response } = yield call(selectAccountByNo, val);
      if (response.ok) {
        if (type === 'paymentOu') {
          yield put({
            type: 'updateState',
            payload: {
              paymentOuList: response.datum || [],
            },
          });
        }
        if (type === 'collection') {
          yield put({
            type: 'updateState',
            payload: {
              collectionList: response.datum || [],
            },
          });
        }
      }
    },

    // 银行账号名称
    *selectApplyAccounts({ payload }, { call, select, put, all }) {
      const { val, type } = payload;
      const { status, response } = yield call(selectApplyAccounts, val);
      let receivingBank = '';
      if (response.ok) {
        receivingBank = response.datum || '';
        if (type === 'paymentOu') {
          yield put({
            type: 'updateForm',
            payload: {
              relatedBank: receivingBank,
            },
          });
        }
        if (type === 'collection') {
          yield put({
            type: 'updateForm',
            payload: {
              collectionBank: receivingBank,
            },
          });
        }
      }
      return receivingBank;
    },

    *clearForm({ payload }, { call, put, select }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
          paymentOuList: [],
          collectionList: [],
        },
      });
    },

    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, { pageNo: payload.pageNo });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
      }
      return {};
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
