import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import update from 'immutability-helper';
import { isNil } from 'ramda';
import { projectManagementSaveRq } from '@/services/workbench/project';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultState = {
  formData: {
    dataList: [],
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  dataSource: [],
  deleteKeys: [],
};
export default {
  namespace: 'projectRisk',

  state: defaultState,

  effects: {
    *projectManagementAllApprove({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectManagementSaveRq, payload);

      message({ type: 'success' });
      closeThenGoto(`/user/flow/process?type=procs`);

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
    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      if (Array.isArray(element)) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
          }
        });
      } else {
        newFormData = { ...formData, ...payload };
      }

      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
