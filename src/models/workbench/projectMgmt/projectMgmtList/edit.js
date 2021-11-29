import {
  projectManagementSaveRq,
  projectManagementOverallRq,
  projectManagementDetailRq,
  projectTemplateRq,
} from '@/services/workbench/project';
import moment from 'moment';
import router from 'umi/router';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { isEmpty } from 'ramda';
import { genFakeId } from '@/utils/mathUtils';

// 默认状态
const defaultState = {
  formData: {
    projectStatus: 'CREATE',
    createTime: moment().format('YYYY-MM-DD'),
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  projectTemplateList: [],
  attachments: [],
};

export default {
  namespace: 'projectMgmtListEdit',

  state: defaultState,

  // 影响->请求会产生影响。影响到state数据了
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

    *projectManagementEdit({ payload }, { call, put, select }) {
      const { ...params } = payload;

      let data = {};
      if (params.id) {
        const { data: datum } = yield outputHandle(
          projectManagementOverallRq,
          params,
          'projectMgmtListEdit/success'
        );
        data = Array.isArray(datum) && !isEmpty(datum) ? datum[0] : {};
      } else {
        const { data: datum } = yield outputHandle(
          projectManagementSaveRq,
          [params],
          'projectMgmtListEdit/success'
        );
        data = Array.isArray(datum) && !isEmpty(datum) ? datum[0] : {};
      }

      message({ type: 'success' });

      if (params.submit) {
        closeThenGoto(`/user/flow/process?type=procs`);
        return {};
      }

      if (!fromQs().id) {
        router.push(`/workTable/projectMgmt/projectMgmtList/edit?id=${data.id}`);
      } else {
        yield put({
          type: 'queryDetails',
          payload: {
            id: fromQs().id,
          },
        });
      }

      return data;
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

  // 负责更新state
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
