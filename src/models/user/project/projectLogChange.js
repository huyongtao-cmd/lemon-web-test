/* eslint-disable no-nested-ternary */
import moment from 'moment';
import { createProjectLog, getProjectLogById } from '@/services/user/project/projectLogList';
import { findResById } from '@/services/plat/computer';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'projectLogChange',
  state: {
    formData: {},
    pageConfig: {},
    loadFinish: false,
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
    *toChangeView({ payload }, { call, put, select }) {
      const { mode } = payload;
      if (mode === 'change') {
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

    // 保存
    *save({ payload }, { call, put, select }) {
      const { mode, values } = payload;
      if (mode === 'change') {
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
