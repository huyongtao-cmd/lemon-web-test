import {
  getCosteIdRq,
  offerSaveRq,
  offerListRq,
  offerDelRq,
  offerUpdateRq,
  offerUpdateStatusRq,
  offerFlowDetailRq,
  offerPassRq,
  offerSaveFlowRq,
  updateOfferlStatusRq,
} from '@/services/user/management/opportunity';
import createMessage from '@/components/core/AlertMessage';
import { getViewConf } from '@/services/gen/flow';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';
import { getUrl } from '@/utils/flowToRouter';
import { fromQs } from '@/utils/stringUtils';
import { isEmpty } from 'ramda';

const defaultFormData = {};

const defaultRuleList = [
  { id: 0, ruleNo: '0', ruleDesc: '没有违背以下任何条款', flag: 0 },
  { id: 1, ruleNo: '1', ruleDesc: '商务报价低于公司规定的利润', flag: 0 },
  { id: 2, ruleNo: '2', ruleDesc: '在准备合同模板、SOW模板时必须使用公司标准模板', flag: 0 },
  { id: 3, ruleNo: '3', ruleDesc: '不同的子项目要单独的报价和相应 付款计划', flag: 0 },
  { id: 4, ruleNo: '4', ruleDesc: '不承诺承诺未来合作的费率', flag: 0 },
  { id: 5, ruleNo: '5', ruleDesc: '不得含上线后的免费运维', flag: 0 },
  { id: 6, ruleNo: '6', ruleDesc: '质量保修/保质一年，仅限于我们自己开发的程序的Bug修正', flag: 0 },
  { id: 7, ruleNo: '7', ruleDesc: '软件合同与服务合同分立两个合同，税率不同', flag: 0 },
  { id: 8, ruleNo: '8', ruleDesc: '不得承诺无限许可证、不承诺赠送产品、人天、服务', flag: 0 },
  { id: 9, ruleNo: '9', ruleDesc: '不得承诺赠送任何第三方软件许可证。', flag: 0 },

  { id: 10, ruleNo: '10', ruleDesc: '不承诺再次购买第三方软件许可证的折扣或价格', flag: 0 },
  { id: 11, ruleNo: '11', ruleDesc: '不承诺明确的上线时间', flag: 0 },
  { id: 12, ruleNo: '12', ruleDesc: '不得承诺我们无法实现的技术分险实施风险', flag: 0 },
  { id: 13, ruleNo: '13', ruleDesc: '合同中乙方交付责任与甲方的付款条件的违约责任对等', flag: 0 },
  { id: 14, ruleNo: '14', ruleDesc: '不接受任何退款的惩罚条件', flag: 0 },
  { id: 15, ruleNo: '15', ruleDesc: '合同的收款比例上线前要大于70%', flag: 0 },
  { id: 16, ruleNo: '16', ruleDesc: '如果尾款时长没有超过半年', flag: 0 },
  { id: 17, ruleNo: '17', ruleDesc: '知识产权归属我司，甲方有使用权', flag: 0 },
  { id: 18, ruleNo: '18', ruleDesc: '合同中没有“包括不限于….”的字眼', flag: 0 },
  {
    id: 19,
    ruleNo: '19',
    ruleDesc: '项目涉及的第三方采购价已经确认，合同条款背靠背或与客户的条款优于我们采购条款',
    flag: 0,
  },

  { id: 20, ruleNo: '20', ruleDesc: '合同签署必须有不低于20%的首付款', flag: 0 },
  { id: 21, ruleNo: '21', ruleDesc: '承诺的第三方销售渠道费用在报价前已明确并得到批准', flag: 0 },
  { id: 22, ruleNo: '22', ruleDesc: '承诺的第三方销售渠道费用确认是“毛费用”而不是净费用', flag: 0 },
  { id: 23, ruleNo: '23', ruleDesc: '客户没有其他导致我们成本与风险增加的条款', flag: 0 },
];

const defaultList = [];

export default {
  namespace: 'opportunityQuote',

  state: {
    list: defaultList,
    selectedList: [],
    ruleList: defaultRuleList,
    formData: {},
    pageConfig: {
      pageBlockViews: [],
    },
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      salesmanResId: undefined,
      dirty: false,
    },
    basicData: {},
    flowFormData: {},
    costeId: null,
  },

  effects: {
    *updateOfferlStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(updateOfferlStatusRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const { id } = fromQs();
          yield put({ type: 'offerList', payload: { id } });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
    },
    *offerPass({ payload }, { call, put, select }) {
      const { status, response } = yield call(offerPassRq, payload);

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
    *offerFlowDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(offerFlowDetailRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          const { twOppoOfferApprView } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              list: Array.isArray(twOppoOfferApprView) ? twOppoOfferApprView : [],
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
    *offerSaveFlow({ payload }, { call, put, select }) {
      const { resId } = payload;

      const { selectedList } = yield select(({ opportunityQuote }) => opportunityQuote);
      // const { signResId, signBuId } = selectedList[0];
      // if (signResId !== resId && signBuId !== resId) {
      //   createMessage({
      //     type: 'warn',
      //     description: '只有签单BU负责人和签单负责人可以发起审批流程！',
      //   });
      //   return {};
      // }
      const { id } = fromQs();
      const { status, response } = yield call(offerSaveFlowRq, {
        defkey: 'ACC_A72',
        oppoOfferEntity: selectedList[0],
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
      const { list, flowFormData } = yield select(({ opportunityQuote }) => opportunityQuote);
      const { status, response } = yield call(offerSaveFlowRq, {
        defkey: 'ACC_A72',
        oppoOfferEntity: list[0],
        apprStatus: 'NOSUBMIT',
        ...flowFormData,
        oppoOfferView: null,
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
    *getCosteId({ payload }, { call, put }) {
      const { status, response } = yield call(getCosteIdRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            costeId: response?.datum?.id,
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: '获取激活成本估算附件主键失败！' });
      return {};
    },
    *getCosteIdFlow({ payload }, { call, put, select }) {
      const { status, response } = yield call(getCosteIdRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        const { list } = yield select(({ opportunityQuote }) => opportunityQuote);
        yield put({
          type: 'updateState',
          payload: {
            list: [{ ...list[0], costeId: response?.datum?.id }],
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: '获取激活成本估算附件主键失败！' });
      return {};
    },
    *offerSave({ payload }, { put, call, select }) {
      const { status, response } = yield call(offerSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        const { id } = fromQs();
        yield put({ type: 'offerList', payload: { id } });
        return response;
      }
      createMessage({ type: 'error', description: '保存失败' });
      return {};
    },
    *offerUpdate({ payload }, { put, call, select }) {
      const { list } = yield select(({ opportunityQuote }) => opportunityQuote);
      const { status, response } = yield call(offerUpdateRq, list);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const { id } = fromQs();
        yield put({ type: 'offerList', payload: { id } });
        return response;
      }
      createMessage({ type: 'error', description: '操作失败' });
      return {};
    },
    *offerList({ payload }, { call, put, select }) {
      const { response } = yield call(offerListRq, payload);
      const { costeId } = yield select(({ opportunityQuote }) => opportunityQuote);

      yield put({
        type: 'updateState',
        payload: {
          list: Array.isArray(response?.datum?.twOppoOfferView)
            ? response?.datum?.twOppoOfferView.map(v => ({ ...v, costeId }))
            : [],
          basicData: response?.datum || {},
        },
      });
    },
    *offerDel({ payload }, { call, put, select }) {
      const { status, response } = yield call(offerDelRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '删除失败' });
        return {};
      }
      return {};
    },
    *offerUpdateStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(offerUpdateStatusRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '激活成功' });
          const { id } = fromQs();
          yield put({ type: 'offerList', payload: { id } });
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
