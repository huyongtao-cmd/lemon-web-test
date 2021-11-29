import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { customSelectionCascader } from '@/services/production/system';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';

const defaultState = {
  formData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  dataSource: [],
  contractClass2List: [],
};
export default {
  namespace: 'contractList',

  state: defaultState,

  effects: {
    // 获取配置字段
    *customSelectionCascaderRq({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(customSelectionCascader, payload);
      yield put({
        type: 'updateState',
        payload: {
          contractClass2List: Array.isArray(data)
            ? data.map(item => ({
                ...item,
                value: item.selectionValue,
                title: item.selectionName,
              }))
            : [],
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
