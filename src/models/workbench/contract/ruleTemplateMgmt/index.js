import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import {
  customSelectionListByKey, // 自定义选择项
  customSelectionCascader, // 自定义选择项级联选择
} from '@/services/production/system';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';

const defaultState = {
  formData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  dataSource: [],
  associatedObjectClass1List: [],
  associatedObjectClass2List: [],
};
export default {
  namespace: 'ruleTemplateMgmt',

  state: defaultState,

  effects: {
    *queryAssociatedObjectClass2({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(customSelectionCascader, payload);

      yield put({
        type: 'updateState',
        payload: {
          associatedObjectClass2List: data.map(item => ({
            ...item,
            value: item.selectionValue,
            title: item.selectionName,
          })),
        },
      });
    },

    *queryAssociatedObjectClass1({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(customSelectionListByKey, { key: payload });

      yield put({
        type: 'updateState',
        payload: {
          associatedObjectClass1List: data.map(item => ({
            ...item,
            value: item.selectionValue,
            title: item.selectionName,
          })),
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
