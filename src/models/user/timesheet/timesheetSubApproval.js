import {
  queryTimeSheetsDetail,
  selectUsers,
  queryReasonList,
  selectBus,
  approvedTimesheets,
  canceledTimesheets,
  rejectedTimesheets,
} from '@/services/user/timesheet/timesheet';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';

// 按明细审批工时
export default {
  namespace: 'userTimesheetSubApproval',

  state: {
    dataSource: [],
    total: 0,
    searchForm: { tsStatus: 'APPROVING' },
    projSource: [],
    projList: [], // 项目
    resList: [],
    resSource: [], // 资源
    buList: [],
    buSource: [], // BU
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        projId: payload && payload.projId ? payload.projId.id : undefined,
        tsResId: payload && payload.tsResId ? payload.tsResId.id : undefined,
        buId: payload && payload.buId ? payload.buId.id : undefined,
      };

      const { response } = yield call(queryTimeSheetsDetail, newPayload);
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
    // 通过审批
    *approvedTimesheets({ payload }, { call, put }) {
      const { status, response } = yield call(approvedTimesheets, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else if (response.reason) {
        createMessage({ type: 'warn', description: `${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '操作失败,请联系管理员' });
      }
    },
    // 拒绝
    *rejectedTimesheets({ payload }, { call, put }) {
      const { status, response } = yield call(
        rejectedTimesheets,
        { ids: payload.ids },
        payload.apprResult
      );
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else if (response.reason) {
        createMessage({ type: 'warn', description: `${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '操作失败,请联系管理员' });
      }
    },
    // 取消审批
    *canceledTimesheets({ payload, callback }, { call, put }) {
      const { status, response } = yield call(canceledTimesheets, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else if (response.reason) {
        if (response.errCode === 'NG_TIMESHEET_CANCLE_CONTAIN_SETTLED') {
          createConfirm({
            content: `${response.reason}`,
            onOk: () => {
              canceledTimesheets({ ...payload, confirm: true }).then(data => {
                callback();
              });
            },
          });
        } else {
          createMessage({ type: 'warn', description: `${response.reason}` });
        }
      } else {
        createMessage({ type: 'error', description: '操作失败,请联系管理员' });
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
    cleanSearchForm(state, { payload }) {
      return {
        ...state,
        searchForm: { ...payload },
      };
    },
  },
};
