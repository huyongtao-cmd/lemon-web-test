import { resDetailRq, changeBaseSubmitRq } from '@/services/plat/res/resprofile';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryUserPrincipal } from '@/services/gen/user';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';
import { launchFlowFn } from '@/services/sys/flowHandle';

export default {
  namespace: 'changeBaseSs',

  state: {
    formData: {},
    resData: [],
    baseBuData: [],
  },

  effects: {
    *queryUserPrincipal({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { resId, resName } = response.extInfo || {};
        yield put({
          type: 'queryResDetail',
          payload: resId,
        });
        yield put({
          type: 'updateForm',
          payload: {
            resId,
            applyResId: isNil(resId) ? undefined : resId + '',
            applyResName: resName,
            applyDate: moment().format('YYYY-MM-DD'),
            submit: 'true',
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取资源信息失败' });
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
    *queryResDetail({ payload }, { call, put }) {
      const { status, response } = yield call(resDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response && response.ok) {
          const data = response.datum || {};
          yield put({
            type: 'updateForm',
            payload: {
              ...data,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取离职资源详情失败' });
        }
      }
    },

    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ changeBaseSs }) => changeBaseSs);
      const {
        applyResId,
        applyDate,
        enrollDate,
        coopType,
        ouId,
        baseBuId,
        baseCity,
        // oldBaseCity,
        newBaseCity,
        // oldSecurityPl,
        newSecurityPl,
        chgReason,
      } = formData;
      let { oldSecurityPl } = formData;
      oldSecurityPl = oldSecurityPl || baseCity;
      const obj = {
        applyResId,
        applyDate,
        enrollDate,
        coopType,
        ouId,
        baseBuId,
        oldBaseCity: baseCity,
        newBaseCity,
        oldSecurityPl,
        newSecurityPl,
        chgReason,
      };
      if (baseCity !== newBaseCity || newSecurityPl !== oldSecurityPl) {
        const { status, response } = yield call(changeBaseSubmitRq, obj);
        if (response.ok) {
          const responseFlow = yield call(launchFlowFn, {
            defkey: 'ORG_G02',
            value: {
              id: response.datum,
            },
          });
          const response2 = responseFlow.response;
          if (response2 && response2.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process?type=procs`);
          } else {
            createMessage({ type: 'error', description: response2.reason || '操作失败' });
          }
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      } else {
        createMessage({ type: 'warn', description: 'Base地和社保缴纳地必须至少一个有变更' });
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
