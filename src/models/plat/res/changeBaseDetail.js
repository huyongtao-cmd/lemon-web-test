import {
  resDetailRq,
  changeBaseSubmitRq,
  changeBaseDetailRq,
} from '@/services/plat/res/resprofile';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { getViewConf } from '@/services/gen/flow';
import { queryUserPrincipal } from '@/services/gen/user';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';

export default {
  namespace: 'changeBaseSsDetail',

  state: {
    formData: {},
    resData: [],
    baseBuData: [],
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },

  effects: {
    *getDetail({ payload }, { call, put }) {
      const { response } = yield call(changeBaseDetailRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详情出错' });
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
          },
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
        },
      });
    },
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuData: list,
        },
      });
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ changeBaseSsDetail }) => changeBaseSsDetail);
      const { oldBaseCity, newBaseCity, newSecurityPl, oldSecurityPl } = formData;
      if (oldBaseCity !== newBaseCity || newSecurityPl !== oldSecurityPl) {
        const { status, response } = yield call(changeBaseSubmitRq, { ...formData, ...payload });
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          return { ok: true };
        }
        createMessage({ type: 'error', description: response.reason || '操作失败' });
        return {};
      }
      createMessage({ type: 'warn', description: 'Base地和社保缴纳地必须至少一个有变更' });
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
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
