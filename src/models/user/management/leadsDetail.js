import {
  findLeadById,
  selectUsers,
  update,
  closeLead,
  close,
  updateLeadAdmin,
  finsh,
} from '@/services/user/management/leads';
import { getViewConf, pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { businessPageDetailByNo, businessPageDetailByNos } from '@/services/sys/system/pageConfig';

const formDataModal = {
  id: 0,
  leadsNo: null,
  leadsName: null,
  remark: null,
  custName: null,
  custContact: null,
  contactPhone: null,
  contactDept: null,
  contactPosition: null,
  salesmanName: undefined,
  salesmanResId: undefined,
  leadsStatusDesc: null,
  leadsStatus: null,
  closeReasonDesc: null,
  closeReason: null,
  createUserName: null,
  createUserId: null,
  createTime: null,
  sourceType: 'INTERNAL',
  externalIden: null,
  externalName: null,
  externalPhone: null,
  internalBuName: undefined,
  internalBuId: undefined,
  internalResName: undefined,
  internalResId: undefined,
};

export default {
  namespace: 'userLeadsDetail',

  state: {
    formData: {
      ...formDataModal,
    },
    page: 'leads', // 返回线索管理或者我报备的线索
    userList: [],
    buList: [],
    salemanList: [],
    salemanSource: [],
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      salesmanResId: undefined,
      dirty: false,
    },
    salesmanResRecord: undefined,
    pageConfig: {},
    leaderConfig: {},
    saleConfig: {},
    leaderReviewConfig: {},
    lastLeaderConfig: {},
  },

  effects: {
    //
    *leadAdmin({ payload }, { put, call, select }) {
      const { status, response } = yield call(updateLeadAdmin, payload);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response && response.ok) {
        if (response.datum.errorCode) {
          // createMessage({ type: 'error', description: response.datum.errorCode });
          return false;
        }
        // createMessage({ type: 'success', description: '保存成功' });
        return true;
      }
      // createMessage({ type: 'error', description: '保存失败' });
      return false;
    },
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findLeadById, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: datum || {},
            page: payload.page || 'leads',
            mode: payload.mode || 'create',
          },
        });
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
              salesmanResId: undefined,
              dirty: false,
            },
          },
        });
      }
    },
    *selectUsers(_, { call, put }) {
      const response = yield call(selectUsers);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            userList: Array.isArray(response.response) ? response.response : [],
            salemanList: Array.isArray(response.response) ? response.response : [],
            salemanSource: Array.isArray(response.response) ? response.response : [],
          },
        });
      }
    },
    *save({ payload }, { put, call, select }) {
      const { status, response } = yield call(update, payload);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response && response.ok) {
        if (response.datum.errorCode) {
          // createMessage({ type: 'error', description: response.datum.errorCode });
          return false;
        }
        createMessage({ type: 'success', description: '操作成功' });
        return true;
      }
      createMessage({ type: 'error', description: '操作失败' });
      return false;
    },
    *finsh({ payload }, { put, call, select }) {
      console.warn('领奖');
      const { status, response } = yield call(finsh, payload);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response && response.ok) {
        if (response.datum.errorCode) {
          // createMessage({ type: 'error', description: response.datum.errorCode });
          return false;
        }
        createMessage({ type: 'success', description: '操作成功' });
        return true;
      }
      createMessage({ type: 'error', description: '操作失败' });
      return false;
    },
    // 关闭线索
    *close({ payload }, { put, call, select }) {
      const { status, response } = yield call(closeLead, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        return response;
      }
      createMessage({ type: 'error', description: '操作失败' });
      return {};
    },
    // 线索关闭原因
    *saveCloseReason({ payload }, { put, call, select }) {
      const { status, response } = yield call(closeLead, {
        id: payload.id,
        reason: payload.closeReason,
      });
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response && response.ok) {
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '线索关闭失败' });
      return false;
    },
    *approvalLeads({ payload }, { call }) {
      const { taskId, params } = payload;
      const { status } = yield call(pushFlowTask, taskId, params);
      if (status === 200) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/flow/process`);
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: { formData: { ...formDataModal } },
      });
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
    },
    *getPageConfigs({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNos, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfos ? response.configInfos.LEADS_MANAGEMENT_DETAILS : {}, // 线索详情页面
            leaderConfig: response.configInfos ? response.configInfos.LEADS_MANAGEMENT_ASSIGN : {}, // 	线索管理员分配审批页面
            saleConfig: response.configInfos ? response.configInfos.LEADS_MANAGEMENT_DISPOSE : {}, // 销售负责人处理审批页面
            leaderReviewConfig: response.configInfos
              ? response.configInfos.LEADS_MANAGEMENT_EXAMINE
              : {}, // 线索管理员审核审批页面
            lastLeaderConfig: response.configInfos
              ? response.configInfos.LEADS_MANAGEMENT_RECIEVE
              : {}, // 	报备人领奖页面
          },
        });
        return response;
      }
      return {};
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    // 修改form表单字段内容，将数据保存到state
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
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
  },
};
