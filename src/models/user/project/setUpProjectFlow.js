import {
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
  namespace: 'setUpProjectFlow',
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
          const { queryData } = yield select(({ setUpProjectFlow }) => setUpProjectFlow);
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
    // 查询相关子合同
    *contractSource({ payload }, { call, put, select }) {
      const { status, response } = yield call(contractSourceUriRq, payload);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateForm',
        payload: {
          twUiSelects: [...list],
        },
      });
    },
    *contractSourceDetail({ payload }, { call, put }) {
      const { status, response } = yield call(contractSourceDetailUriRq, payload);
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateForm1',
            payload: {
              ouId: response.datum.ouId,
              ouName: response.datum.ouName,
              workType: response.datum.workType,
              workTypeDesc: response.datum.workTypeDesc,
              deliveryAddress: response.datum.deliveryAddress,
              custpaytravelFlag: response.datum.custpaytravelFlag,
              currCodeDesc: response.datum.currCodeDesc,
              userdefinedNo: response.datum.userdefinedNo,
              amt: response.datum.amt,
              taxRate: response.datum.taxRate,
              effectiveAmt: response.datum.effectiveAmt,
              closeReason: response.datum.closeReason,
            },
          });
        }
      }
    },
    // 申请人重新提交项目
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
    // bu负责人创建项目
    *BUCreate({ payload }, { call, put, select }) {
      const { queryData, formData, dataSource, deleteKeys } = yield select(
        ({ setUpProjectFlow }) => setUpProjectFlow
      );
      if (formData.planEndDate && moment(formData.planEndDate).isBefore(formData.planStartDate)) {
        createMessage({ type: 'error', description: '预计结束日期不应该早于预计开始日期' });
        return;
      }
      if (dataSource.length > 0) {
        formData.reportPlanEntityList = dataSource.map(data => {
          if (data.periodDate && data.periodDate.length < 8) {
            // eslint-disable-next-line no-param-reassign
            data.periodDate += '-01';
          }
          return data;
        });
      }
      if (deleteKeys.length > 0) {
        formData.deleteReportPlans = deleteKeys;
      }
      const param = {
        projectEntity: {
          projName: queryData.projectRequestView.projName,
          resId: queryData.projectRequestView.resId,
          applyDate: queryData.projectRequestView.applyDate,
          ...formData,
        },
        projectRequestEntity: { ...queryData.projectRequestView, ...payload },
        contractEntity: {
          deliBuId: queryData.projectRequestView.deliBuId,
          deliResId: queryData.projectRequestView.deliResId,
          salesmanResId: queryData.projectRequestView.salesmanResId,
          id: formData.contractId,
        },
      };
      const { status, response } = yield call(setUpProjectBUCreateUriRq, param);
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
    // bu负责人修改项目
    *BUupdate({ payload }, { call, put, select }) {
      const { queryData, formData, dataSource, deleteKeys } = yield select(
        ({ setUpProjectFlow }) => setUpProjectFlow
      );
      if (formData.planEndDate && moment(formData.planEndDate).isBefore(formData.planStartDate)) {
        createMessage({ type: 'error', description: '预计结束日期不应该早于预计开始日期' });
        return;
      }
      if (dataSource.length > 0) {
        formData.reportPlanEntityList = dataSource.map(data => {
          if (data.periodDate && data.periodDate.length < 8) {
            // eslint-disable-next-line no-param-reassign
            data.periodDate += '-01';
          }
          return data;
        });
      }
      if (deleteKeys.length > 0) {
        formData.deleteReportPlans = deleteKeys;
      }
      const param = {
        projectEntity: {
          projName: queryData.projectRequestView.projName,
          resId: queryData.projectRequestView.resId,
          applyDate: queryData.projectRequestView.applyDate,
          ...formData,
        },
        projectRequestEntity: { ...queryData.projectRequestView, ...payload },
        contractEntity: {
          deliBuId: queryData.projectRequestView.deliBuId,
          deliResId: queryData.projectRequestView.deliResId,
          salesmanResId: queryData.projectRequestView.salesmanResId,
          id: formData.contractId,
        },
        // requestContentView:{...queryData.requestContentView}
      };
      const { status, response } = yield call(setUpProjectBUCreateUriRq, param);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
        yield put({
          type: 'updateState',
          payload: {
            currentState: '',
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    // 销售负责人通过填写
    *salesManCreate({ payload }, { call, put, select }) {
      const { queryData } = yield select(({ setUpProjectFlow }) => setUpProjectFlow);
      const param = {
        projectRequestEntity: { ...queryData.projectRequestView, ...payload },
      };
      const { status, response } = yield call(setUpProjectSalesManCreateUriRq, param);
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
    // pmo通过填写
    *pmoCreate({ payload }, { call, put, select }) {
      const { queryData } = yield select(({ setUpProjectFlow }) => setUpProjectFlow);
      const param = {
        projectRequestEntity: { ...queryData.projectRequestView, ...payload },
      };
      const { status, response } = yield call(setUpProjectPmoCreateUriRq, param);
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
    // 项目经理通过填写
    *projectManagerCreate({ payload }, { call, put, select }) {
      const { queryData } = yield select(({ setUpProjectFlow }) => setUpProjectFlow);
      const param = {
        projectRequestEntity: { ...queryData.projectRequestView, ...payload },
      };
      const { status, response } = yield call(setUpProjectProjManagerCreateUriRq, param);
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
