import { findUserTaskById, findTaskComp } from '@/services/user/task/task';
import { queryUserPrincipal } from '@/services/gen/user';
import { isEval } from '@/services/gen/eval';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { passAndReturnFlowFn } from '@/services/sys/flowHandle';
import { getViewConf } from '@/services/gen/flow';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

// 主表空数据
const emptyFormData = {
  id: null,
  taskNo: null,
  taskStatus: 'CREATE',
  disterResId: null,
  disterResName: '',
  jobType1: null,
  jobType2: null,
  capasetLeveldId: 1,
  expenseBuId: 1,
  receiverBuId: 2,
  receiverResId: 1,
  resSourceType: null,
  reasonType: '01',
  reasonNo: null,
  allowTransferFlag: 0,
  planStartDate: '',
  planEndDate: '',
  acceptMethod: null,
  pricingMethod: '',
  buSettlePrice: 0,
  eqvaRatio: 1,
  eqvaQty: 0,
  rice: null,
  guaranteeRate: 0,
  cooperationType: null,
  attachuploadMethod: '',
  remark: '',
  createTime: '',
  settledEqva: null,
  settlePrice: null,
  resActivityList: [],
  viewNo: 2, // 视图编号(1:管理视图,2:普通成员视图)
};

export default {
  namespace: 'userTaskView',

  state: {
    formData: {
      ...emptyFormData,
    },
    dataList: [],
    fieldsConfig: {
      panels: [],
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    pageConfig: {},
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...emptyFormData,
          },
          dataList: [],
        },
      });
    },

    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(findUserTaskById, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
            dataList: Array.isArray((response.datum || {}).resActivityList)
              ? (response.datum || {}).resActivityList
              : [],
          },
        });
      } else if (response.errCode) {
        createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
      } else {
        // createMessage({ type: 'error', description: '查询失败,请联系管理员1' }); // 因为当量结算完成后弹出的评价窗口，在点击确定后，会拿当量结算表的id查询任务包详情，导致提示此查询失败的消息，所以此处不报错
      }
      return response.datum || {};
    },

    *isEval({ payload }, { call, put }) {
      const { status, response } = yield call(isEval, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            hasEval: response.datum, // 评价
          },
        });
      }
    },

    *principal({ payload }, { call, put }) {
      const { response } = yield call(queryUserPrincipal);
      yield put({
        type: 'updateState',
        payload: {
          resId: response.extInfo.resId,
        },
      });
      return response.extInfo.resId;
    },
    *findTaskComp({ payload }, { call, put }) {
      const { response } = yield call(findTaskComp, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
            dataList: Array.isArray((response.datum || {}).resActivityList)
              ? (response.datum || {}).resActivityList
              : [],
          },
        });
      } else if (response.errCode) {
        createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
      } else {
        createMessage({ type: 'error', description: '查询失败,请联系管理员2' });
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
      }
    },
    *flowHandle({ payload }, { call, put }) {
      const { status, response } = yield call(passAndReturnFlowFn, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        // closeThenGoto('/user/flow/process');// 先弹出评价窗口，评价完后在跳转页面
        return true;
      }
      createMessage({ type: 'error', description: '操作失败' });
      return false;
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
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
