import {
  projectManagementOverallRq,
  projectManagementDetailRq,
  projectTemplateRq,
} from '@/services/workbench/project';
import { getViewConf } from '@/services/gen/flow';
import moment from 'moment';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';

const defaultState = {
  formData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
  attachments: [],
};
export default {
  namespace: 'projectMgmtListFlow',

  state: defaultState,

  effects: {
    *projectTemplate({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectTemplateRq, payload);
      yield put({
        type: 'updateState',
        payload: {
          projectTemplateList: Array.isArray(data.rows)
            ? data.rows.map(item => ({
                ...item,
                value: item.id,
                title: item.projectTemplateName,
              }))
            : [],
        },
      });
    },

    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectManagementDetailRq, payload);
      const { attachments } = data;
      const enclosure = attachments.map(item => item.id);
      yield put({
        type: 'updateForm',
        payload: {
          ...data,
          enclosure,
        },
      });
      yield put({
        type: 'updateState',
        payload: {
          attachments,
        },
      });
    },

    *submit({ payload }, { call, put, select }) {
      const { ...params } = payload;

      const { data } = yield outputHandle(
        projectManagementOverallRq,
        params,
        'projectMgmtListFlow/success'
      );

      message({ type: 'success' });
      const url = getUrl().replace('edit', 'view');
      closeThenGoto(url);

      return data;
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
          },
        });
        return response || {};
      }
      return {};
    },

    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo || {},
          },
        });
        return response;
      }
      return {};
    },

    *init({ payload }, { put, select }) {
      const { id, copy = false } = payload;
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(projectManagementDetailRq, { id });
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj },
        },
      });
    },

    *success({ payload }, { put, select }) {
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });

      // 页面变为详情模式，更新数据
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });

      // 赋值
      yield put({
        type: 'init',
        payload,
      });
    },
  },

  reducers: {
    ...commonModelReducers(defaultState),

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
