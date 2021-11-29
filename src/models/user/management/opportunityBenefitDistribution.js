import {
  benefitSaveRq,
  benefitListRq,
  benefitDelRq,
  benefitUpdateStatusRq,
  benefitSaveFlowRq,
  benefitFlowDetailRq,
  benefitPassRq,
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

const defaultBenefitDistributionList = [];

export default {
  namespace: 'opportunityBenefitDistribution',

  state: {
    pageConfig1: {
      pageBlockViews: [],
    },
    formData: defaultFormData,
    ruleList: defaultRuleList,
    benefitDistributionList: defaultBenefitDistributionList,
    selectedBenefitDistributionList: [],
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      salesmanResId: undefined,
      dirty: false,
    },
    list2: [],
    flowFormData: {},
    basicData: {},
  },

  effects: {
    *benefitPass({ payload }, { call, put, select }) {
      const { status, response } = yield call(benefitPassRq, payload);

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
    *benefitFlowDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(benefitFlowDetailRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          const { oppoBenefitAiiotView } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              list2: Array.isArray(oppoBenefitAiiotView) ? oppoBenefitAiiotView : [],
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
    *benefitSaveFlow({ payload }, { call, put, select }) {
      const { resId } = payload;
      const { selectedBenefitDistributionList } = yield select(
        ({ opportunityBenefitDistribution }) => opportunityBenefitDistribution
      );
      const { deliResId, deliBuId, estResId } = selectedBenefitDistributionList[0];

      // if (deliBuId === resId && estResId === resId) {
      //   createMessage({
      //     type: 'warn',
      //     description: '商机交付BU负责人录入的利益分配，不用提交流程，保存后可以直接激活！',
      //   });
      //   return {};
      // }
      // if (deliResId !== resId) {
      //   createMessage({
      //     type: 'warn',
      //     description: '只有商机交付负责人，审批状态新建的利益分配规则可以发起审批流程！',
      //   });
      //   return {};
      // }
      const { id } = fromQs();
      const { status, response } = yield call(benefitSaveFlowRq, {
        defkey: 'ACC_A73',
        oppoBenefitAiiotEntity: selectedBenefitDistributionList[0],
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
      const { list2, flowFormData } = yield select(
        ({ opportunityBenefitDistribution }) => opportunityBenefitDistribution
      );
      const { status, response } = yield call(benefitSaveFlowRq, {
        defkey: 'ACC_A73',
        oppoBenefitAiiotEntity: list2[0],
        apprStatus: 'NOSUBMIT',
        ...flowFormData,
        oppoBenefitAiiotView: null,
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

    *benefitSave({ payload }, { put, call, select }) {
      const { benefitDistributionList } = yield select(
        ({ opportunityBenefitDistribution }) => opportunityBenefitDistribution
      );
      const { status, response } = yield call(benefitSaveRq, benefitDistributionList);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { id } = fromQs();
        yield put({ type: 'benefitList', payload: { id } });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return {};
    },
    *benefitList({ payload }, { call, put }) {
      const { response } = yield call(benefitListRq, payload);
      yield put({
        type: 'updateState',
        payload: {
          benefitDistributionList: Array.isArray(response?.datum?.twOppoBenefitAiiotView)
            ? response?.datum?.twOppoBenefitAiiotView
            : [],
          basicData: response?.datum || {},
        },
      });
    },
    *benefitDel({ payload }, { call, put, select }) {
      const { status, response } = yield call(benefitDelRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          return response;
        }
        return {};
      }
      return {};
    },
    *benefitUpdateStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(benefitUpdateStatusRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '激活成功' });
          const { id } = fromQs();
          yield put({ type: 'benefitList', payload: { id } });
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
    *getPageConfig1({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig1: response.configInfo || {},
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
