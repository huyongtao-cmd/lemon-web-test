import { isEmpty, isNil } from 'ramda';
import moment from 'moment';
import { getTeamInfo } from '@/services/user/center/myTeam';
import { selectUsers, selectBus } from '@/services/gen/list';

const defaultSearchForm = {
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
  namespace: 'resPlanDetail',
  state: {
    searchForm: defaultSearchForm,
    dynamicColumnsCfg: [],
    list: [],
    total: 0,
    resList: [],
    buList: [],
    orgList: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getTeamInfo, payload);

      if (response) {
        const { rows, total } = response;
        const list = Array.isArray(rows) ? rows : [];
        // const listNew = list.filter(v => !((v.planTypeName === '商机' || v.planTypeName === '项目') && isNil(v.oppProjName) && isEmpty(v.yearWeeks.filter(item => item.days !== ' '))))
        yield put({
          type: 'updateState',
          payload: {
            list: list.map(({ yearWeeks, ...restProperties }) => {
              if (isNil(yearWeeks)) return restProperties;
              return {
                ...restProperties,
                ...yearWeeks
                  .map(v => ({ [v.priodDay]: v }))
                  .reduce((prev, curr) => ({ ...prev, ...curr }), {}),
              };
            }),
            dynamicColumnsCfg: isEmpty(list)
              ? []
              : (list[0].yearWeeks &&
                  list[0].yearWeeks.map((value, index) => ({
                    main: `第${value.week}周`,
                    sub: `(${value.priodDay})`,
                    key: value.priodDay,
                  }))) ||
                [],
            total,
          },
        });
      }
    },
    *queryResSelect({ payload }, { call, put }) {
      const { response } = yield call(selectUsers);
      yield put({
        type: 'updateState',
        payload: {
          resList: Array.isArray(response) ? response : [],
        },
      });
    },
    *queryBuSelect({ payload }, { call, put }) {
      const { response } = yield call(selectBus);
      yield put({
        type: 'updateState',
        payload: {
          buList: Array.isArray(response) ? response : [],
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
