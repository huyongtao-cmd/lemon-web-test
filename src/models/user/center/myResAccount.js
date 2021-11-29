import { isEmpty, pickAll, mapObjIndexed, omit } from 'ramda';
import { add as mathAdd, sub } from '@/utils/mathUtils';
import { queryResAccountInfo, queryResAccountList } from '@/services/user/center/myTeam';

const defaultSearchForm = {
  date: undefined, // 期间
  dateFrom: undefined,
  dateTo: undefined,
};

export default {
  namespace: 'resAccount',

  state: {
    searchForm: defaultSearchForm,
    resInfo: {},
    dataSource: [],
    total: undefined,
  },

  effects: {
    *queryResInfo({ payload }, { call, put }) {
      const { response } = yield call(queryResAccountInfo, payload);
      yield put({
        type: 'updateState',
        payload: {
          resInfo: response.datum || {},
        },
      });
    },
    *query({ payload }, { call, put }) {
      const { id, ...params } = payload;
      const { response } = yield call(queryResAccountList, id, params);
      // 合计表格数据
      const list = Array.isArray(response.rows) ? response.rows : [];
      if (isEmpty(list) || list[0] === null) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: [],
            total: 0,
          },
        });
      } else {
        const caclList = ['iqtySum', 'iamtSum', 'oqtySum', 'oamtSum'];
        const initialItem = { iqtySum: 0, iamtSum: 0, oqtySum: 0, oamtSum: 0 };
        const totalItems = list.reduce(
          (prev, curr) =>
            caclList
              .map(key => ({ [key]: mathAdd(prev[key] || 0, curr[key] || 0) }))
              .reduce((p, c) => ({ ...p, ...c }), {}),
          initialItem
        );

        const totalLine = {
          ...mapObjIndexed(value => -1, omit(caclList, list[0] || {})),
          ...totalItems,
        };
        const compileList = [...list, totalLine];

        yield put({
          type: 'updateState',
          payload: {
            dataSource: compileList,
            total: response.rows[0] !== null ? response.total : 0,
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
        searchForm: defaultSearchForm,
      };
    },
  },
};
