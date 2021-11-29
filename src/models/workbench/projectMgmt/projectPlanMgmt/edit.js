import {
  projectPlanListRq,
  projectPhaseIncreaseRq,
  projectPhaseOverallRq,
  projectPhaseDetailRq,
} from '@/services/workbench/project';
import moment from 'moment';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/mathUtils';

const defaultState = {
  formData: {
    executeStatus: 'TO_BE_STARTED',
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
};
export default {
  namespace: 'projectPhaseEdit',

  state: defaultState,

  effects: {
    // 项目计划编辑
    *phaseEdit({ payload }, { call, put, select }) {
      const { ...params } = payload;

      let data = {};
      if (!fromQs().id) {
        const { data: datum } = yield outputHandle(
          projectPhaseIncreaseRq,
          params,
          'projectPhaseEdit/success'
        );
        data = datum;
        message({ type: 'success' });

        if (data.id) {
          const { id } = data;
          const { projectId } = params;
          router.push(
            `/workTable/projectMgmt/projectPlanMgmt/edit?id=${id}&projectId=${projectId}&mode=EDIT`
          );
        } else {
          createMessage({ type: 'error', description: '后端未返回主数据Id' });
        }
      } else {
        const { data: datum } = yield outputHandle(
          projectPhaseOverallRq,
          params,
          'projectPhaseEdit/success'
        );
        data = datum;
        message({ type: 'success' });

        yield put({
          type: 'phaseDetail',
          payload: {
            id: fromQs().id,
          },
        });
      }
      return data;
    },
    // 项目计划详情
    *phaseDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectPhaseDetailRq, payload);

      yield put({
        type: 'updateForm',
        payload: data,
      });

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
      const { data } = yield outputHandle(projectPhaseDetailRq, { id });
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
    updateModalForm(state, { payload }) {
      const { modalformdata } = state;
      const newFormData = { ...modalformdata, ...payload };
      return {
        ...state,
        modalformdata: newFormData,
      };
    },
  },
};
