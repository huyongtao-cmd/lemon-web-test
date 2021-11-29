import {
  templatePlanIncreaseRq,
  templatePlanOverallRq,
  templatePlanDetailRq,
  templatePhasePagingRq,
} from '@/services/workbench/project';
import moment from 'moment';
import router from 'umi/router';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/mathUtils';

const defaultState = {
  formData: {
    enableFlag: true,
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  phaseList: [],
};
export default {
  namespace: 'planEdit',

  state: defaultState,

  effects: {
    // 阶段列表
    *projectPhaseList({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(templatePhasePagingRq, payload);
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
    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(templatePlanDetailRq, payload);
      yield put({
        type: 'updateForm',
        payload: {
          ...data,
        },
      });
    },

    *edit({ payload }, { call, put, select }) {
      const { ...params } = payload;
      const { flag } = payload;
      let data = {};
      if (params.id) {
        const { data: datum } = yield outputHandle(
          templatePlanOverallRq,
          params,
          'templatePlanEdit/success'
        );
        data = datum;
      } else {
        const { data: datum } = yield outputHandle(
          templatePlanIncreaseRq,
          params,
          'templatePlanEdit/success'
        );
        data = datum;
      }

      message({ type: 'success' });

      // 此操作致死，增加页面五秒空白时长，暂未找到原因
      // yield put({
      //   type: 'updateForm',
      //   payload: data,
      // });
      if (!flag) {
        router.push(
          `/workTable/projectMgmt/WBSTemplate/planEdit?id=${data.id}&projectTemplateId=${
            payload.projectTemplateId
          }`
        );
      } else {
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
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
      const { data } = yield outputHandle(templatePlanDetailRq, { id });
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
