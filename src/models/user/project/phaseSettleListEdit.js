import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import {
  phaseSettleListCreate,
  phaseSettleListModify,
  phaseSettleListDetail,
  phaseSettleListFindTimeSheet,
} from '@/services/user/project/project';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultFormData = {
  tsDate: [
    formatDT(
      moment()
        .subtract(1, 'months')
        .startOf('month')
    ),
    formatDT(
      moment()
        .subtract(1, 'months')
        .endOf('month')
    ),
  ],
};

const defaultState = {
  formData: { ...defaultFormData },
  dataSource: [],
  mode: 'add',
};

export default {
  namespace: 'phaseSettleListEdit',
  state: defaultState,
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(phaseSettleListDetail, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
          },
        });
      }
    },

    *queryTimeSheet({ payload }, { call, put, select }) {
      const { status, response } = yield call(phaseSettleListFindTimeSheet, payload);
      if (status === 200 && response.ok) {
        const days = response.datum.reduce((total, ts) => total + ts.days, 0);
        const amt = response.datum.reduce((total, ts) => total + ts.days * ts.price, 0);

        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.datum || [],
          },
        });
        yield put({
          type: 'updateForm',
          payload: {
            days,
            amt,
          },
        });
      } else {
        createMessage({ type: 'warn', description: response.reason });
        yield put({
          type: 'updateState',
          payload: {
            dataSource: [],
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        // 修改
        // if (payload.briefStatus !== 'CREATE') {
        //   createMessage({ type: 'warn', description: '只有新增状态的可以修改！' });
        //   return;
        // }
        response = yield call(phaseSettleListModify, payload);
      } else {
        // 新增
        response = yield call(phaseSettleListCreate, payload);
      }
      if (response.response && response.response.ok) {
        // 保存成功
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'clear',
        });
        closeThenGoto('/user/project/phaseSettleListList');
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
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

    clear(state, { payload }) {
      return defaultState;
    },
  },
};
