import {
  queryTimeSheets,
  selectUsers,
  selectBus,
  queryReasonList,
  timesheetAdminApprovalRq,
} from '@/services/user/timesheet/timesheet';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'userTimesheet',

  state: {
    dataSource: [],
    total: 0,
    searchForm: {},
    projSource: [],
    projList: [], // 项目
    resList: [],
    resSource: [], // 资源
    buList: [],
    buSource: [], // BU
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const newPayload = {
        ...payload,
        projId: payload && payload.projId ? payload.projId.id : undefined,
        tsResId: payload && payload.tsResId ? payload.tsResId.id : undefined,
        // buId: payload && payload.buId ? payload.buId.id : undefined,
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
    *adminApproval({ payload }, { call, put, select }) {
      const { status, response } = yield call(timesheetAdminApprovalRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const { searchForm } = yield select(({ userTimesheet }) => userTimesheet);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },
    // 获得资源下拉数据
    *queryResList({ payload }, { call, put }) {
      const response = yield call(selectUsers);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            resList: Array.isArray(response.response) ? response.response : [],
            resSource: Array.isArray(response.response) ? response.response : [],
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
            projSource: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    // bu下拉
    *selectBus(_, { call, put }) {
      const response = yield call(selectBus);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            buList: Array.isArray(response.response) ? response.response : [],
            buSource: Array.isArray(response.response) ? response.response : [],
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
  },
};
