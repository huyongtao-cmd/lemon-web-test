import {
  abstractChangeDetailUpdateUri,
  setUpProjectCreateDetailRq,
  setUpProjectCreateUriRq,
  setUpProjectBUDetailUriRq,
  contractSourceUriRq,
  contractSourceDetailUriRq,
  setUpProjectBUCreateUriRq,
  setUpProjectSalesManCreateUriRq,
  setUpProjectPmoCreateUriRq,
  setUpProjectProjManagerCreateUriRq,
} from '@/services/user/project/project';
import { getViewConf } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';

const defaultQueryData = {
  projectRequestView: {},
  projectView: {
    custpaytravelFlag: null,
    epibolyPermitFlag: null,
    subcontractPermitFlag: null,
    finishApproveFlag: null,
    muiltiTaskFlag: null,
    autoReportFlag: null,
  },
  // requestContentView:{}
};

export default {
  namespace: 'changeProjectBudgetFlow',
  state: {
    queryData: defaultQueryData,
    formData: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
    dataSource: [],
    deleteKeys: [],
    currentState: '',
  },
  effects: {
    // 项目申请人重新申请
    *queryProjList({ payload }, { call, put }) {
      const { status, response } = yield call(setUpProjectCreateDetailRq, payload);
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateForm1',
            payload: {
              ...response,
            },
          });
        }
      }
    },
    // bu负责人进来之后要先获取申请人填写的信息
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(setUpProjectBUDetailUriRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateForm',
            payload: {
              ...defaultQueryData,
              ...response,
            },
          });
          yield put({
            type: 'updateForm1',
            payload: {
              planStartDate: response.projectRequestView.planStartDate,
              planEndDate: response.projectRequestView.planEndDate,
              projTempId: response.projectRequestView.projTempId,
            },
          });
          const { queryData } = yield select(
            ({ changeProjectBudgetFlow }) => changeProjectBudgetFlow
          );
          const { projectView } = queryData;
          if (projectView) {
            if (projectView.reportPlanViews) {
              yield put({
                type: 'updateState',
                payload: {
                  dataSource: projectView.reportPlanViews,
                },
              });
            }
          }
        }
        return response;
      }
      return {};
    },
    // 申请人重新提交预算
    *submit({ payload }, { call, put, select }) {
      const { status, response } = yield call(setUpProjectCreateUriRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      }
      return {};
    },
    *changeBudgetUpdate({ payload }, { call, put, select }) {
      const { status, response } = yield call(abstractChangeDetailUpdateUri, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response;
      }
      return {};
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          queryData: defaultQueryData,
          formData: {},
          currentState: null,
          dataSource: [],
        },
      });
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
    updateForm(state, { payload }) {
      const { queryData } = state;
      const newQueryData = { ...queryData, ...payload };
      return {
        ...state,
        queryData: newQueryData,
      };
    },
    updateForm1(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
