import {
  findLeadById,
  selectUsers,
  create,
  update,
  selectBus,
} from '@/services/user/management/leads';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

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
  namespace: 'userLeadsEdit',

  state: {
    formData: {
      ...formDataModal,
    },
    mode: 'create',
    page: 'leads', // 返回线索管理或者我报备的线索
    salemanList: [],
    userList: [],
    buList: [],
    salemanSource: [],
    userSource: [],
    buSource: [],
    pageConfig: {},
  },

  effects: {
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
        return datum;
      }
      return {};
    },
    *selectUsers(_, { call, put }) {
      const response = yield call(selectUsers);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            userList: Array.isArray(response.response) ? response.response : [],
            userSource: Array.isArray(response.response) ? response.response : [],
            salemanList: Array.isArray(response.response) ? response.response : [],
            salemanSource: Array.isArray(response.response) ? response.response : [],
          },
        });
      }
    },
    *selectBus(_, { call, put }) {
      const response = yield call(selectBus);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            buList: Array.isArray(response.response) ? response.response : [],
            buSource: Array.isArray(response.response) ? response.response : [],
          },
        });
      }
    },
    *save({ payload }, { put, call, select }) {
      const { formData, page } = yield select(({ userLeadsEdit }) => userLeadsEdit);
      if (formData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(update, formData);
        if (response && response.ok) {
          if (response.datum.errorCode) return response.datum.errorCode;
          return { status, rst: true };
        }
        return { status, rst: '保存失败' };
      }
      // 新增的保存方法
      const { status, response } = yield call(create, formData);

      if (response && response.ok) {
        if (response.datum.errorCode) return response.datum.errorCode;
        return { status, rst: true };
      }
      return { status, rst: '保存失败' };
    },
    // 提交流程
    *submit({ payload }, { put, call, select }) {
      const { status, response } = yield call(update, { ...payload.formData, submitted: true });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        if (response.datum.errorCode) {
          createMessage({ type: 'error', description: response.datum.errorCode });
        } else {
          createMessage({ type: 'success', description: '提交成功' });
          payload.page && payload.page === 'myleads'
            ? closeThenGoto(`/user/center/${payload.page}`)
            : closeThenGoto(`/sale/management/${payload.page}`);
        }
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: { formData: { ...formDataModal }, mode: 'create' },
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
  },
};
