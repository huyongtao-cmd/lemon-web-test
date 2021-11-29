import { getTodo, getAllProcs } from '@/services/user/flow/flow';
import {
  cancelFlow,
  changeApproverRq,
  changeAllApproverRq,
  changeAssigneeByTaskIdRq,
} from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  no: undefined,
  name: undefined,
  info: undefined,
  startTime: undefined,
  initiatorName: undefined,
  defId: undefined,
};

export default {
  namespace: 'flowTodo',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { sinceDate, untilDate } = payload;
      const params = { ...payload };
      if (sinceDate && typeof sinceDate !== 'string') {
        params.sinceDate = sinceDate.format('YYYY-MM-DD');
      }
      if (untilDate && typeof untilDate !== 'string') {
        params.untilDate = untilDate.format('YYYY-MM-DD');
      }
      const { response, status } = yield call(getTodo, params);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },
    *changeApprover({ payload }, { call, put, select }) {
      if (payload.newParams.lastApprover) {
        const { status, response } = yield call(changeAllApproverRq, payload);
        if (status === 200) {
          if (response.ok) {
            createMessage({ type: 'success', description: `变更审批人成功--${response.reason}` });
          } else {
            createMessage({ type: 'error', description: response.reason });
          }
          const { searchForm } = yield select(({ flowProcsAll }) => flowProcsAll);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
        } else if (status === 100) {
          // 主动取消请求，不做操作
        } else createMessage({ type: 'error', description: response.renson || '变更失败' });
      } else if (payload.newParams.idList) {
        const { status, response } = yield call(changeApproverRq, payload);
        if (status === 200) {
          if (response.ok) {
            createMessage({ type: 'success', description: response.renson || '变更审批人成功' });
          } else {
            createMessage({ type: 'error', description: response.reason });
          }
          const { searchForm } = yield select(({ flowProcsAll }) => flowProcsAll);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
        } else if (status === 100) {
          // 主动取消请求，不做操作
        } else createMessage({ type: 'error', description: response.renson || '变更失败' });
      }
    },
    *changeApproverByTaskId({ payload }, { call, put, select }) {
      if (payload.newParams.lastApprover) {
        const { status, response } = yield call(changeAssigneeByTaskIdRq, payload);
        if (status === 200) {
          if (response.ok) {
            createMessage({ type: 'success', description: `变更审批人成功--${response.reason}` });
          } else {
            createMessage({ type: 'error', description: response.reason });
          }
          const { searchForm } = yield select(({ flowProcsAll }) => flowProcsAll);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
        } else if (status === 100) {
          // 主动取消请求，不做操作
        } else createMessage({ type: 'error', description: response.renson || '变更失败' });
      } else if (payload.newParams.idList) {
        const { status, response } = yield call(changeAssigneeByTaskIdRq, payload);
        if (status === 200) {
          if (response.ok) {
            createMessage({ type: 'success', description: response.renson || '变更审批人成功' });
          } else {
            createMessage({ type: 'error', description: response.reason });
          }
          const { searchForm } = yield select(({ flowProcsAll }) => flowProcsAll);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          yield put({ type: 'updateSearchForm', payload: { selectedRowKeys: [] } });
        } else if (status === 100) {
          // 主动取消请求，不做操作
        } else createMessage({ type: 'error', description: response.renson || '变更失败' });
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
