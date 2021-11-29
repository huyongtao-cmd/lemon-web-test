/* eslint-disable no-nested-ternary */
import moment from 'moment';
import {
  createProjectLogHistory,
  getProjectLogByDemandId,
  getProjectApprovalDetailsById,
  getProjectRecordLists,
  getProjectRecordList,
  createProjectRecordHistory,
  findProjectChangeLogLists,
  projectLogApproved,
} from '@/services/user/project/projectLogList';
import { getViewConf } from '@/services/gen/flow';
import { findResById } from '@/services/plat/computer';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'projectLogApprovalDetails',
  state: {
    formData: {},
    timelineData: [],
    recordData: [],
    approvalData: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
    pageConfig: {},
    loadFinish: false,
    timelineDataCount: 0,
    loadMoreLoading: false,
  },

  effects: {
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
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },
    *toDetailView({ payload }, { call, put, select }) {
      const { currentMode } = payload;
      if (currentMode === 'detail') {
        const { id } = payload;
        const { status, response } = yield call(getProjectLogByDemandId, id);
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
    *approved({ payload }, { call, put, select }) {
      const { status, response } = yield call(projectLogApproved, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程审批失败' });
      }
    },
    *findProjectChangeLogList({ payload }, { call, put, select }) {
      const { currentMode } = payload;
      if (currentMode === 'detail') {
        const { demandId } = payload;
        const { status, response } = yield call(findProjectChangeLogLists, payload);
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
      const { currentMode } = payload;
      if (currentMode === 'detail') {
        const { demandId } = payload;
        const { status, response } = yield call(getProjectRecordLists, demandId);
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

    *getProjectApprovalDetailById({ payload }, { call, put, select }) {
      const { id } = payload;
      const { status, response } = yield call(getProjectApprovalDetailsById, id);
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
      const { currentMode, values } = payload;
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
      const { currentMode, values } = payload;
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
