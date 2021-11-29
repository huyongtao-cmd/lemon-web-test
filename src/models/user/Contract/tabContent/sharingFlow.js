import {
  startChildContractProcRq,
  queryChildContractFlowDetailRq,
  getPlatformProfileList,
  examineByProfitAgreeRq,
} from '@/services/user/Contract/profitSharing';
import { closeFlowRq } from '@/services/user/flow/flow';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import { isEmpty } from 'ramda';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'sharingFlow',

  state: {
    formData: {},
    ruleList: [],
    dataList: [],
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {
      buttons: [],
      panels: {
        disabledOrHidden: {},
      },
    },
    pageConfig: {},
  },

  effects: {
    /* 获取详情 */
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryChildContractFlowDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum || {},
            ruleList: Array.isArray(response.datum.profitAgreeAfts)
              ? response.datum.profitAgreeAfts
              : [],
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      return {};
    },
    /* 获取主表详情 */
    *querydataList({ payload }, { call, put, select }) {
      const { status, response } = yield call(getPlatformProfileList, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      yield put({
        type: 'updateState',
        payload: {
          dataList: [response.datum || {}].filter(x => !isEmpty(x)),
        },
      });
    },
    // 提交发起流程
    *submit({ payload }, { call, put, select }) {
      const { formData, ruleList } = yield select(({ sharingFlow }) => sharingFlow);
      formData.profitAgreeAfts = ruleList;
      const parmars = { ...formData, ...payload };

      const { status, response } = yield call(startChildContractProcRq, parmars);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程审批失败' });
      }
    },
    // 第二节点流程审批
    *flowApproveSecond({ payload }, { call, put, select }) {
      const { taskId, ...parmars } = payload;
      const { status, response } = yield call(examineByProfitAgreeRq, taskId, parmars);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程审批失败' });
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: isEmpty(response)
              ? {
                  buttons: [],
                  panels: {
                    disabledOrHidden: {},
                  },
                }
              : response,
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
    },
    *closeFlow({ payload }, { call, put, select }) {
      const { status, response } = yield call(closeFlowRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '流程关闭成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程关闭失败' });
      }
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
