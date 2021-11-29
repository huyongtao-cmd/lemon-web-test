import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import update from 'immutability-helper';
import { isNil } from 'ramda';
import {
  projectPlanListRq,
  projectPlanIncreaseRq,
  projectPlanOverallRq,
  projectPlanDetailRq,
  planMemberRq,
  projectMemberPageRq,
  projectPhaseListRq,
} from '@/services/workbench/project';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultState = {
  formData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  dataSource: [],
  deleteKeys: [],
  planTypeVisible: false,
};
export default {
  namespace: 'dailyReportList',

  state: defaultState,

  effects: {
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
  },

  reducers: {
    ...commonModelReducers(defaultState),
  },
};
