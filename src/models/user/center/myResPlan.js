import { isEmpty, mapObjIndexed, keys } from 'ramda';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { queryResInfo, queryResPlanList } from '@/services/user/center/myTeam';
// import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';

const defaultSearchForm = {
  id: fromQs().resId,
  DateRange: [
    moment()
      .startOf('week')
      .add(1, 'day'),
    moment()
      .startOf('week')
      .add(1, 'day')
      .add(3, 'month')
      .startOf('week')
      .add(1, 'day'),
  ],
};

export default {
  namespace: 'resPlan',
  state: {
    searchForm: defaultSearchForm,
    dynamicColumnsCfg: [],
    list: [],
    total: null,
    resInfo: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryResPlanList, payload);
      if (response) {
        const { rows, total } = response;
        const list = Array.isArray(rows) ? rows : [];
        const dynamicColumnsCfgObj = isEmpty(list)
          ? []
          : mapObjIndexed((value, key) => {
              const { resPlanCurrentWeek, startDate, endDate } = value;
              return {
                main: `第${resPlanCurrentWeek}周`,
                sub: `(${formatDT(startDate, 'MM/DD')}~${formatDT(endDate, 'MM/DD')})`,
                key,
              };
            }, list[0].manDayOfWeek || {});
        yield put({
          type: 'updateState',
          payload: {
            list: list.map(({ manDayOfWeek, ...restProperties }) => ({
              ...restProperties,
              ...manDayOfWeek,
            })),
            dynamicColumnsCfg: keys(dynamicColumnsCfgObj).map(key => dynamicColumnsCfgObj[key]),
            total,
          },
        });
      }
    },
    *queryResInfo({ payload }, { call, put }) {
      const { response } = yield call(queryResInfo, payload);
      yield put({
        type: 'updateState',
        payload: {
          resInfo: response.datum || {},
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
