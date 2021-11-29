import {
  costeListRq,
  costeDelRq,
  updateStatusRq,
  costeSaveRq,
  costeUpdateRq,
  saveFlowRq,
  saveFlowDetailRq,
  costePassRq,
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
  { id: 0, ruleNo: '0', ruleDesc: '没有违背以下任何条款', flag: 0 },
  { id: 1, ruleNo: '1', ruleDesc: '人天预估成本不准确或需要审批', flag: 0 },
  { id: 2, ruleNo: '2', ruleDesc: '公司标准SOW商务假设没有被修改', flag: 0 },
  { id: 3, ruleNo: '3', ruleDesc: '不同的子项目或子系统，对应不同SOW', flag: 0 },
  { id: 4, ruleNo: '4', ruleDesc: '所实施的模块及大致功能要列清楚', flag: 0 },
  { id: 5, ruleNo: '5', ruleDesc: '报表必须限定一定的张数或一定的人天数', flag: 0 },
  { id: 6, ruleNo: '6', ruleDesc: '不能承诺导入历史数据。除非另外已经计入成本', flag: 0 },
  { id: 7, ruleNo: '7', ruleDesc: '不能承诺多次切换或与老系统的并行切换', flag: 0 },
  { id: 8, ruleNo: '8', ruleDesc: '接口必须明确都包含哪些接口', flag: 0 },
  {
    id: 9,
    ruleNo: '9',
    ruleDesc: '不得承诺客户业务增长量” “成本降低…..”“人员减少…” “发生问题限期XX天解决问题” 等指标',
    flag: 0,
  },

  {
    id: 10,
    ruleNo: '10',
    ruleDesc: '所有合同和SOW不得承诺“建立平台”“自动预测”“自动计划”等字眼',
    flag: 0,
  },
  {
    id: 11,
    ruleNo: '11',
    ruleDesc: '实施法人数量必须确认清单，注意未知法人的业务是否与主体业务的同质性',
    flag: 0,
  },
  { id: 12, ruleNo: '12', ruleDesc: '必须限定在一定的客制化人天数', flag: 0 },
  { id: 13, ruleNo: '13', ruleDesc: '客户没有额外的导致成本增加和风险的特殊需求写入SOW', flag: 0 },
];

export default {
  namespace: 'opportunityCostEstimation',

  state: {
    list: [],
    selectedList: [],
    pageConfig: {
      pageBlockViews: [],
    },
    formData: defaultFormData,
    ruleList: defaultRuleList,

    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      salesmanResId: undefined,
      dirty: false,
    },
    list1: [],
    flowFormData: {},
    basicData: {},
  },

  effects: {
    *costePass({ payload }, { call, put, select }) {
      const { status, response } = yield call(costePassRq, payload);

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
    *saveFlowDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(saveFlowDetailRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          const { costeEstimateView } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              list1: Array.isArray(costeEstimateView) ? costeEstimateView : [],
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
    *saveFlow({ payload }, { call, put, select }) {
      const { resId } = payload;
      const { selectedList } = yield select(
        ({ opportunityCostEstimation }) => opportunityCostEstimation
      );
      // const { deliResId, deliBuId, costResId } = selectedList[0];
      // if (resId === deliBuId && resId === costResId) {
      //   createMessage({
      //     type: 'warn',
      //     description: '商机交付BU负责人录入的成本估算，不用提交流程，保存后可以直接激活！',
      //   });
      //   return {};
      // }
      // if (deliResId !== resId) {
      //   createMessage({
      //     type: 'warn',
      //     description: '只有商机交付负责人，审批状态新建的成本估算规则可以发起审批流程！',
      //   });
      //   return {};
      // }
      const { id } = fromQs();
      const { status, response } = yield call(saveFlowRq, {
        defkey: 'ACC_A71',
        oppoCosteEstimateEntity: selectedList[0],
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
      const { list1, flowFormData } = yield select(
        ({ opportunityCostEstimation }) => opportunityCostEstimation
      );
      const { status, response } = yield call(saveFlowRq, {
        defkey: 'ACC_A71',
        oppoCosteEstimateEntity: list1[0],
        apprStatus: 'NOSUBMIT',
        ...flowFormData,
        costeEstimateView: null,
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

    *updateStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(updateStatusRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '激活成功' });
          const { id } = fromQs();
          yield put({ type: 'costeList', payload: { id } });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
    },
    *costeDel({ payload }, { call, put, select }) {
      const { status, response } = yield call(costeDelRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          return response;
        }
        return {};
      }
      return {};
    },
    *costeSave({ payload }, { put, call, select }) {
      const { status, response } = yield call(costeSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        const { id } = fromQs();
        yield put({ type: 'costeList', payload: { id } });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return {};
    },
    *costeList({ payload }, { call, put }) {
      const { response } = yield call(costeListRq, payload);
      yield put({
        type: 'updateState',
        payload: {
          list: Array.isArray(response?.datum?.twOppoCosteEstimateView)
            ? response?.datum?.twOppoCosteEstimateView
            : [],
          basicData: response.datum || {},
        },
      });
    },
    *costeUpdate({ payload }, { put, call, select }) {
      const { list } = yield select(({ opportunityCostEstimation }) => opportunityCostEstimation);
      const { status, response } = yield call(costeUpdateRq, list);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { id } = fromQs();
        yield put({ type: 'costeList', payload: { id } });
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
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
