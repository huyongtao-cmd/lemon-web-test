import {
  channelSaveRq,
  channelListRq,
  channelDelRq,
  channelUpdateStateRq,
  channelSaveFlowRq,
  channelFlowDetailRq,
  channelPassRq,
} from '@/services/user/management/opportunity';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { isEmpty } from 'ramda';

const defaultFormData = {};

const defaultRuleList = [
  {
    id: 1,
    ruleNo: 'C',
    ruleDesc: '成本会导致亏损',
    flag: 0,
  },
  {
    id: 2,
    ruleNo: 'No',
    ruleDesc: '以上规则都不不符合',
    flag: 0,
  },
];

const defaultChannelFeeList = [];

export default {
  namespace: 'opportunityChannelFee',

  state: {
    pageConfig2: {
      pageBlockViews: [],
    },
    formData: defaultFormData,
    ruleList: defaultRuleList,
    channelFeeList: defaultChannelFeeList,
    selectedChannelFeeList: [],
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      salesmanResId: undefined,
      dirty: false,
    },
    list3: [],
    flowFormData: {},
    basicData: {},
  },

  effects: {
    *channelPass({ payload }, { call, put, select }) {
      const { status, response } = yield call(channelPassRq, payload);

      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return {};
    },
    *channelFlowDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(channelFlowDetailRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          const { oppoChannelCosttView } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              list3: Array.isArray(oppoChannelCosttView) ? oppoChannelCosttView : [],
              flowFormData: response.datum,
            },
          });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '获取详情信息失败' });
        return {};
      }
      return {};
    },
    *channelSaveFlow({ payload }, { call, put, select }) {
      const { resId } = payload;
      const { selectedChannelFeeList } = yield select(
        ({ opportunityChannelFee }) => opportunityChannelFee
      );
      // const { signBuId } = selectedChannelFeeList[0];
      // if (signBuId !== resId) {
      //   createMessage({ type: 'warn', description: '只有签单BU负责人可以发起审批流程！' });
      //   return {};
      // }
      const { id } = fromQs();
      const { status, response } = yield call(channelSaveFlowRq, {
        defkey: 'ACC_A74',
        oppoChannelCosttEntity: selectedChannelFeeList[0],
        oppoId: id,
        apprStatus: 'NOSUBMIT',
        id: null,
      });

      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/user/flow/process?type=procs');
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return {};
    },
    *saveFlowAgain({ payload }, { call, put, select }) {
      const { list3, flowFormData } = yield select(
        ({ opportunityChannelFee }) => opportunityChannelFee
      );
      const { status, response } = yield call(channelSaveFlowRq, {
        defkey: 'ACC_A74',
        oppoChannelCosttEntity: list3[0],
        apprStatus: 'NOSUBMIT',
        ...flowFormData,
        oppoChannelCosttView: null,
        ...payload,
      });

      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return {};
    },
    *channelSave({ payload }, { put, call, select }) {
      const { channelFeeList } = yield select(({ opportunityChannelFee }) => opportunityChannelFee);
      const { status, response } = yield call(channelSaveRq, channelFeeList);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        const { id } = fromQs();
        yield put({ type: 'channelList', payload: { id } });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return {};
    },
    *channelList({ payload }, { call, put }) {
      const { response } = yield call(channelListRq, payload);
      yield put({
        type: 'updateState',
        payload: {
          channelFeeList: Array.isArray(response?.datum?.twOppoChannelCosttView)
            ? response.datum.twOppoChannelCosttView
            : [],
          basicData: response?.datum || {},
        },
      });
    },
    *channelDel({ payload }, { call, put, select }) {
      const { status, response } = yield call(channelDelRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          return response;
        }
        return {};
      }
      return {};
    },
    *channelUpdateState({ payload }, { call, put, select }) {
      const { status, response } = yield call(channelUpdateStateRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '激活成功' });
          const { id } = fromQs();
          yield put({ type: 'channelList', payload: { id } });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
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
    // 获取配置字段
    *getPageConfig2({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig2: response.configInfo || {},
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
