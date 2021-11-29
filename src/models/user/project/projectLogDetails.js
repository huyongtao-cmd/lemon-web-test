/* eslint-disable no-nested-ternary */
import moment from 'moment';
import {
  createProjectLogHistory,
  getProjectLogById,
  getProjectApprovalById,
  getProjectChangeLogList,
  getProjectRecordList,
  createProjectRecordHistory,
  deleteProjectLogs,
} from '@/services/user/project/projectLogList';
import { findResById } from '@/services/plat/computer';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab, closeThenGoto, markAsTab, markAsNoTab } from '@/layouts/routerControl';

export default {
  namespace: 'projectLogDetails',
  state: {
    formData: {},
    timelineData: [],
    recordData: [],
    approvalData: {},
    pageConfig: {},
    loadFinish: false,
    timelineDataCount: 0,
    loadMoreLoading: false,
  },

  effects: {
    // 删除
    *delete({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ calerdarList }) => calerdarList);
      const { status, response } = yield call(deleteProjectLogs, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          closeThenGoto('/user/project/logList');
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
    },
    *toDetailView({ payload }, { call, put, select }) {
      const { mode } = payload;
      if (mode === 'detail') {
        const { id } = payload;
        const { status, response } = yield call(getProjectLogById, id);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          yield put({
            type: 'updateState',
            payload: {
              formData: response.datum,
              loadFinish: true,
            },
          });
        }
      }
      return {};
    },

    *findProjectChangeLogList({ payload }, { call, put, select }) {
      const { mode } = payload;
      if (mode === 'detail') {
        const { changeId } = payload;
        const { status, response } = yield call(getProjectChangeLogList, payload);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          const { rows } = response;
          const { total } = response;
          yield put({
            type: 'updateState',
            payload: {
              timelineData: Array.isArray(rows) ? rows : [],
              timelineDataCount: total,
            },
          });
        }
      }
      return {};
    },
    *findProjectRecordList({ payload }, { call, put, select }) {
      const { mode } = payload;
      if (mode === 'detail') {
        const { changeId } = payload;
        const { status, response } = yield call(getProjectRecordList, changeId);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          const { rows } = response;
          yield put({
            type: 'updateState',
            payload: {
              recordData: Array.isArray(rows) ? rows : [],
            },
          });
        }
      }
      return {};
    },

    *getProjectApprovalById({ payload }, { call, put, select }) {
      const { mode, projectId } = payload;
      const { status, response } = yield call(getProjectApprovalById, projectId);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        const { rows } = response;
        const createTime = moment();
        const approvalData = { ...(Array.isArray(rows) ? rows[0] : []), ...createTime };
        yield put({
          type: 'updateState',
          payload: {
            approvalData,
          },
        });
      }
      return {};
    },

    // 保存历史记录
    *save({ payload }, { call, put, select }) {
      const { mode, values } = payload;
      const { status, response } = yield call(createProjectLogHistory, values);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    // 保存跟踪日志
    *saveRecord({ payload }, { call, put, select }) {
      const { mode, values } = payload;
      const { status, response } = yield call(createProjectRecordHistory, values);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
