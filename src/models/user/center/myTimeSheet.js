import { queryTimeSheets, selectUsers, queryReasonList } from '@/services/user/timesheet/timesheet';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { fromQs } from '@/utils/stringUtils';

const defaultSearchForm = {
  tsResId: fromQs().resId,
};

export default {
  namespace: 'teamTimeSheet',

  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: undefined,
    projList: [], // 项目
    resList: [], // 资源
    buList: [], // BU
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const newPayload = {
        ...payload,
        projId: payload && payload.projId ? payload.projId.id : undefined,
        tsResId: payload && payload.tsResId ? payload.tsResId : undefined,
        buId: payload && payload.buId ? payload.buId.id : undefined,
        dateRange: undefined,
        workDateFrom: payload && payload.dateRange ? formatDT(payload.dateRange[0]) : undefined,
        workDateTo: payload && payload.dateRange ? formatDT(payload.dateRange[1]) : undefined,
      };
      const { response } = yield call(queryTimeSheets, newPayload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },
    // 获得资源下拉数据
    *queryResList({ payload }, { call, put }) {
      const response = yield call(selectUsers);
      const resList = Array.isArray(response.response) ? response.response : [];
      const tsResId = fromQs().resId;
      const tsResName = resList.filter(res => `${res.id}` === `${tsResId}`)[0].name;
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            resList,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            tsResId,
            tsResName,
          },
        });
      }
    },
    // 获得项目下拉数据
    *queryProjList({ payload }, { call, put }) {
      const { response } = yield call(queryReasonList);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            projList: Array.isArray(response) ? response : [],
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
