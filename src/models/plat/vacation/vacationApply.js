import { vacationApplyList, vacationApplyDetailRq } from '@/services/plat/vacation/vacation';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';

const defaultSearchForm = {};

export default {
  namespace: 'vacationApply',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    resDataSource: [],
    baseBuDataSource: [],
    formData: {
      resVacationApply: {},
      recentResVacationList: [],
      resVacationList: [],
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { date, ...params } = payload;
      if (Array.isArray(date) && date[0] && date[1]) {
        [params.vdateStart, params.vdateEnd] = date;
      }
      const { response } = yield call(vacationApplyList, params);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
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
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(vacationApplyDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...response.datum,
              },
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      }
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
