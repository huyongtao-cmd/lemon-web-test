import { internalList, internalDeleteRq } from '@/services/plat/res/internal';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { isNil, isEmpty } from 'ramda';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryCascaderUdc } from '@/services/gen/app';
import moment from 'moment';

const defaultSearchForm = {};

export default {
  namespace: 'internal',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    resDataSource: [],
    baseBuDataSource: [],
    formData: {},
    jobType2: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { jobType, regularApprDate, resumeApprDate, ...newPayload } = payload;
      const parmars = {
        ...newPayload,
        jobType1: Array.isArray(jobType) ? jobType[0] : '',
        jobType2: Array.isArray(jobType) ? jobType[1] : '',
      };
      if (
        regularApprDate &&
        regularApprDate[0] !== null &&
        typeof regularApprDate[0] !== 'string'
      ) {
        parmars.regularApprDateStart = regularApprDate[0].format('YYYY-MM-DD');
      }
      if (
        regularApprDate &&
        regularApprDate[1] !== null &&
        typeof regularApprDate[1] !== 'string'
      ) {
        parmars.regularApprDateEnd = regularApprDate[1].format('YYYY-MM-DD');
      }
      if (resumeApprDate && resumeApprDate[0] !== null && typeof resumeApprDate[0] !== 'string') {
        parmars.resumeApprDateStart = resumeApprDate[0].format('YYYY-MM-DD');
      }
      if (resumeApprDate && resumeApprDate[1] !== null && typeof resumeApprDate[1] !== 'string') {
        parmars.resumeApprDateEnd = resumeApprDate[1].format('YYYY-MM-DD');
      }

      const { status, response } = yield call(internalList, parmars);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(internalDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ recruit }) => recruit);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
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
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuDataSource: list,
        },
      });
    },
    // 分类一关联分类二
    *jobTypeChange({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:JOB_TYPE2',
        parentDefId: 'RES:JOB_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { jobType2: Array.isArray(response) ? response : [] },
        });
      }
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
        list: [],
        total: 0,
      };
    },
  },
};
