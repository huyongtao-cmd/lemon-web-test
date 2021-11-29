import {
  stateStatisRq,
  updateStatisRq,
  implementListRq,
  getOkrListByStatusFn,
  getOkrListByUpdateFn,
} from '@/services/okr/okrMgmt';

import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty } from 'ramda';

const defaultFormData = {};

export default {
  namespace: 'runReport',
  state: {
    // 实施周期数
    formData: defaultFormData,
    implementList: [],
    stateStatisList: [],
    updateStatisList: [],
    okrList: [],
    okrListTotal: 0,
  },

  effects: {
    *queryImplementList({ payload }, { call, put }) {
      const { status, response } = yield call(implementListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        const { rows } = response;
        yield put({
          type: 'updateState',
          payload: {
            implementList: Array.isArray(rows) ? rows : [],
          },
        });

        // 计算当前日期在那个目标周期
        const tt = Array.isArray(rows)
          ? rows.filter(v => moment().isAfter(v.beginDate) && moment().isBefore(v.endDate))[0] || {}
          : {};
        yield put({
          type: 'updateForm',
          payload: {
            // eslint-disable-next-line no-nested-ternary
            periodId: !isEmpty(tt) ? tt.id : !isEmpty(rows) ? rows[0].id : undefined,
          },
        });
        // eslint-disable-next-line no-nested-ternary
        return !isEmpty(tt) ? tt : !isEmpty(rows) ? rows[0] : {};
      }
      createMessage({ type: 'error', description: response.reason || '查询失败' });
      return {};
    },

    *queryStateStatis({ payload }, { call, put, select }) {
      const { formData } = yield select(({ runReport }) => runReport);
      const { status, response } = yield call(stateStatisRq, formData);
      if (status === 200) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            stateStatisList: Array.isArray(datum) ? datum : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *queryUpdateStatis({ payload }, { call, put, select }) {
      const { formData } = yield select(({ runReport }) => runReport);
      const { status, response } = yield call(updateStatisRq, formData);
      if (status === 200) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            updateStatisList: Array.isArray(datum) ? datum : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },

    *queryOkrList({ payload }, { call, put, select }) {
      const { qType, id, krStatusValue, updPeriodValue, offset } = payload;
      if (!qType) {
        createMessage({ type: 'error', description: '查询参数错误' });
        return;
      }

      const params = {
        id,
        offset,
        limit: 10,
      };
      let apiFn = '';
      if (qType === 'okrStatus') {
        params.krStatus = krStatusValue;
        apiFn = getOkrListByStatusFn;
      }
      if (qType === 'okrUpdate') {
        params.krStatus = updPeriodValue;
        apiFn = getOkrListByUpdateFn;
      }
      const { status, response } = yield call(apiFn, params);
      if (response) {
        const { rows, total } = response;
        const okrList = Array.isArray(rows) ? rows : [];
        const okrListTotal = total;
        yield put({
          type: 'updateState',
          payload: {
            okrList,
            okrListTotal,
          },
        });
      }
    },

    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          implementList: [],
          stateStatisList: [],
          updateStatisList: [],
          okrList: [],
          okrListTotal: 0,
        },
      });
    },
  },

  reducers: {
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },

    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
