/* eslint-disable no-nested-ternary */
import moment from 'moment';
import {
  createProjectLog,
  getProjectLogById,
  getQuestionInfoById,
  getProjectRecordList,
  getProjectChangeLogList,
} from '@/services/user/project/projectLogList';
import { findResById } from '@/services/plat/computer';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'projectLogEdit',
  state: {
    formData: {},
    timelineData: [],
    pageConfig: {},
    loadFinish: false,
    recordData: [],
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
    *toEditView({ payload }, { call, put, select }) {
      const { mode } = payload;
      if (mode === 'edit') {
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
      if (mode === 'edit') {
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
      if (mode === 'edit') {
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
    *getQuestionInfo({ payload }, { call, put, select }) {
      const { mode, id } = payload;
      const { status, response } = yield call(getQuestionInfoById, id);
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
      return {};
    },
    // 保存
    *save({ payload }, { call, put, select }) {
      const { mode, values } = payload;
      if (mode === 'edit' || mode === 'turned') {
        const { status, response } = yield call(createProjectLog, values);
        if (status === 100) {
          // 主动取消请求
          return {};
        }
        if (status === 200) {
          return response;
        }
        return {};
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
