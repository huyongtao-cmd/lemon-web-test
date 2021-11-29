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
import {
  saveBaseBUInfo,
  getBaseViewList,
  newBaseBUserPass,
  oldBaseBuUserPass,
  newBasePUserPass,
  newBaseMyUserPass,
  newBaseMyUser,
  newBaseHr,
  newBaseHrPass,
  submitBaseBUInfo,
  baseBuInfo,
} from '@/services/user/baseBUChange';
import { getViewConf } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';
import { selectFilterRole } from '@/services/sys/system/datapower';
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
  namespace: 'baseChangeFlow',
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
    resultChkList: [],
    baseBuList: [],
    HrResultChkList: [],
  },
  effects: {
    // 项目申请人重新申请
    *queryProjList({ payload }, { call, put }) {
      const { status, response } = yield call(setUpProjectCreateDetailRq, payload);
      if (status === 200) {
        if (response) {
          yield put({
            type: 'updateForm',
            payload: {
              ...response,
            },
          });
        }
      }
    },
    // 获取流程详情
    *fetchDetail({ payload }, { call, put }) {
      const { status, response } = yield call(getBaseViewList, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: { baseBuList: response.datum },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取失败' });
      return {};
    },
    // bu负责人进来之后要先获取申请人填写的信息
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(getBaseViewList, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum,
            resultChkList: response.datum.chkViewList,
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
    },

    // 申请人重新提交项目
    *submit({ payload }, { call, put, select }) {
      const { status, response } = yield call(submitBaseBUInfo, payload);
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
    // 原baseBU上级通过/拒绝
    *BUCreate({ payload }, { call, put, select }) {
      const { queryData, formData, dataSource, deleteKeys } = yield select(
        ({ baseChangeFlow }) => baseChangeFlow
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
    *BUupdate({ payload }, { call, put, select }) {
      const { queryData, formData, dataSource, deleteKeys } = yield select(
        ({ baseChangeFlow }) => baseChangeFlow
      );
      // const params = {
      //   ...payload,
      //   ...formData,
      // }
      const { status, response } = yield call(newBaseBUserPass, payload);
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
    // 原baseBU领导通过/拒绝
    *oldBaseUserPass({ payload }, { call, put, select }) {
      const { status, response } = yield call(oldBaseBuUserPass, payload);
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

    // 新baseBU上级修改
    *newBasePUserPass({ payload }, { call, put, select }) {
      const { status, response } = yield call(newBasePUserPass, payload);
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
    // 变更资源审批
    *newBaseMyUserPass({ payload }, { call, put, select }) {
      const { status, response } = yield call(newBaseMyUserPass, payload);
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

    // Hr审批
    *newBaseHrApprove({ payload }, { call, put, select }) {
      const { status, response } = yield call(newBaseHrPass, payload);
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

    // 自己审批时获取检查事项
    *checkresult({ payload }, { call, put, select }) {
      const { status, response } = yield call(newBaseMyUser, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: { resultChkList: response.datum.chkViewList },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '检查事项获取失败' });
      return {};
    },
    // Hr审批时获取检查事项
    *HrCheckresult({ payload }, { call, put, select }) {
      const { status, response } = yield call(newBaseHr, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: { HrResultChkList: response.datum },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '检查事项获取失败' });
      return {};
    },
    // 项目经理通过填写
    *projectManagerCreate({ payload }, { call, put, select }) {
      const { queryData } = yield select(({ baseChangeFlow }) => baseChangeFlow);
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
      // console.log('response', response);
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
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      console.log('Ihave updated', newFormData);
      return {
        ...state,
        formData: newFormData,
      };
    },

    // updateForm(state, { payload }) {
    //   const { queryData } = state;
    //   const newQueryData = { ...queryData, ...payload };
    //   return {
    //     ...state,
    //     queryData: newQueryData,
    //   };
    // },
    // updateForm1(state, { payload }) {
    //   const { formData } = state;
    //   const newFormData = { ...formData, ...payload };
    //   return {
    //     ...state,
    //     formData: newFormData,
    //   };
    // },
  },
};
