import { queryTSReportList } from '@/services/plat/reportMgmt';
import { selectUsersWithBu, selectBusWithOus } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty } from 'ramda';
import moment from 'moment';

const defaultSearchForm = {
  month: moment(new Date(), 'YYYY-MM'),
  baseBuId: null,
  upResId: null,
  resId: null,
};

export default {
  namespace: 'timesheetReport',
  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: 0,
    buList: [],
    orgList: [],
    dateCfg: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryTSReportList, payload);
      if (status === 100) return;
      if (status === 200) {
        const { rows, total } = response;
        const { monthDays } = payload;
        const allDays = moment(monthDays).daysInMonth();
        const dataSource = Array.isArray(rows)
          ? rows.map(v => {
              for (let index = 0; index < allDays; index += 1) {
                const tt = v.itemList.filter(
                  obj =>
                    obj.date ===
                    moment(monthDays)
                      .startOf('startOf')
                      .add(index, 'd')
                      .format('YYYY-MM-DD')
                );
                if (!tt.length) {
                  // eslint-disable-next-line no-param-reassign
                  v.itemList = v.itemList.concat({
                    date: moment(monthDays)
                      .startOf('startOf')
                      .add(index, 'd')
                      .format('YYYY-MM-DD'),
                    hours: '',
                    type: '',
                  });
                }
              }
              const tt = v.itemList.sort((a, b) => {
                if (moment(a.date).isBefore(b.date)) {
                  return -1;
                }
                if (moment(a.date).isAfter(b.date)) {
                  return 1;
                }
                return 0;
              });
              return { ...v, itemList: tt };
            })
          : [];

        const dateCfg = !isEmpty(dataSource) ? dataSource[0].itemList : [];
        yield put({
          type: 'updateState',
          payload: {
            dataSource,
            total: total || 0,
            dateCfg,
          },
        });
      }
    },
    *queryOrgSelect({ payload }, { call, put }) {
      const { response } = yield call(selectBusWithOus);
      yield put({
        type: 'updateState',
        payload: {
          orgList: Array.isArray(response) ? response : [],
        },
      });
    },
    *queryBuSelect({ payload }, { call, put }) {
      const { response } = yield call(selectUsersWithBu);
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
