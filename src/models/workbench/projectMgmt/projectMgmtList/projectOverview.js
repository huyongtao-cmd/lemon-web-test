import { projectOverviewRq } from '@/services/workbench/project';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';

const defaultState = {
  formData: {},
  projectView: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'DESCRIPTION',
  planViews: [], // 活动进度
  budgetViews: [], // 超支风险
  riskViews: [], //	风险预警
};
export default {
  namespace: 'projectOverview',

  state: defaultState,

  effects: {
    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectOverviewRq, payload);
      const {
        projectView = {},
        planViews = [],
        budgetViews = [],
        riskViews = [],
        ...restData
      } = data;
      yield put({
        type: 'updateState',
        payload: {
          projectView,
          planViews: Array.isArray(planViews) ? planViews : [],
          budgetViews: Array.isArray(budgetViews) ? budgetViews : [],
          riskViews: Array.isArray(riskViews)
            ? riskViews.sort((a, b) => Number(a.riskLevel) - Number(b.riskLevel))
            : [],
        },
      });

      yield put({
        type: 'updateForm',
        payload: {
          ...restData,
        },
      });
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
      const { data } = yield outputHandle(projectOverviewRq, { id });
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
