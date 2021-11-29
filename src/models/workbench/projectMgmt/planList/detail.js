import {
  projectPlanListRq,
  projectPlanIncreaseRq,
  projectPlanOverallRq,
  projectPlanDetailRq,
  planMemberRq,
  projectMemberPageRq,
  projectPhaseListRq,
} from '@/services/workbench/project';
import {
  customSelectionListByKey, // 自定义选择项
  customSelectionCascader, // 自定义选择项级联选择
} from '@/services/production/system';
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
  formMode: 'DESCRIPTION',
  dataListSelected: [],
  modalformdata: {},
  visible: false,
  memberGroupList: [],
  planList: [],
  projectMemberList: [],
  phaseList: [],
};
export default {
  namespace: 'planListDetail',

  state: defaultState,

  effects: {
    // 阶段列表
    *projectPhaseList({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectPhaseListRq, payload);
      yield put({
        type: 'updateState',
        payload: {
          phaseList: Array.isArray(data.rows)
            ? data.rows.map(item => ({
                ...item,
                value: item.id,
                title: item.phaseName,
              }))
            : [],
        },
      });
      return Array.isArray(data.rows)
        ? data.rows.map(item => ({
            ...item,
            value: item.id,
            title: item.phaseName,
          }))
        : [];
    },

    // 项目成员
    *projectMemberPage({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectMemberPageRq, payload);

      yield put({
        type: 'updateState',
        payload: { projectMemberList: Array(data.rows) ? data.rows : [] },
      });

      return data;
    },

    // 项目计划列表
    *projectPlanList({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectPlanListRq, payload);

      yield put({
        type: 'updateState',
        payload: { planList: data },
      });

      return data;
    },
    // 项目计划编辑
    *projectPlanEdit({ payload }, { call, put, select }) {
      const { ...params } = payload;

      let data = {};
      if (!fromQs().id) {
        const { data: datum } = yield outputHandle(
          projectPlanIncreaseRq,
          params,
          'planListDetail/success'
        );
        data = datum;
        message({ type: 'success' });

        if (data.id) {
          const { id } = data;
          const { planTypeVal1, projectId, planType } = params;
          router.push(
            `/workTable/projectMgmt/planList/edit?id=${id}&projectId=${projectId}&scene=${planTypeVal1}&planType=${planType}&mode=EDIT`
          );
        } else {
          createMessage({ type: 'error', description: '后端未返回主数据Id' });
        }
      } else {
        const { data: datum } = yield outputHandle(
          projectPlanOverallRq,
          params,
          'planListDetail/success'
        );
        data = datum;
        message({ type: 'success' });

        yield put({
          type: 'projectPlanDetail',
          payload: {
            id: fromQs().id,
          },
        });
      }
      return data;
    },
    // 项目计划详情
    *projectPlanDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectPlanDetailRq, payload);

      yield put({
        type: 'updateForm',
        payload: data,
      });

      const { planMemberViews } = data;
      yield put({
        type: 'updateState',
        payload: {
          dataListSelected: planMemberViews.map(v => ({ ...v, id: v.projectMemberId })),
        },
      });

      return data;
    },
    // 成员组别
    *getMemberGroup({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(customSelectionListByKey, payload);
      yield put({
        type: 'updateState',
        payload: {
          memberGroupList: data.map(item => ({
            ...item,
            value: item.selectionValue,
            title: item.selectionName,
          })),
        },
      });
      return data.map(item => ({
        ...item,
        value: item.selectionValue,
        title: item.selectionName,
      }));
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
      const { data } = yield outputHandle(projectPlanDetailRq, { id });
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
