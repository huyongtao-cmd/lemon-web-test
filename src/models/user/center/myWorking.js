import { queryWorkingList } from '@/services/user/center/myTeam';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';

const defaultSearchForm = {
  id: fromQs().resId,
  year: moment().year(),
};

export default {
  namespace: 'working',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    detailList: [],
    tsList: [],
    eqvaList: [],
    detailTitle: undefined,
    resId: null,
    resName: null,
    resNo: null,
    resStatus: null,
    resStatusDesc: null,
    period: null,
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const {
        searchForm: { year },
      } = yield select(({ working }) => working);
      const { resId } = fromQs();
      const { response } = yield call(queryWorkingList, year, resId);
      if (response) {
        const resInfo = response.datum || {};
        const {
          list,
          detailList,
          tsList,
          eqvaList,
          resNo,
          resName,
          resStatus,
          resStatusDesc,
          period,
        } = resInfo;
        yield put({
          type: 'updateState',
          payload: {
            list,
            total: 1,
            detailList,
            tsList,
            eqvaList,
            detailTitle: `${year}年`,
            resId,
            resName,
            resNo,
            resStatus,
            resStatusDesc,
            period,
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
