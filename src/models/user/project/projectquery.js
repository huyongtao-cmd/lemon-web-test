import createMessage from '@/components/core/AlertMessage';
import {
  findProjectById,
  checkDist,
  queryProjectProfitReport,
  queryProjExecutionInfo,
} from '@/services/user/project/project';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultFormData = {
  id: null,
  mainContractId: null, // 主合同id
  contractId: null, // 合同id
  projName: null, // 项目名称
  contractNo: null, // 编号 - 合同
  custIdstDesc: null, // 客户行业
  custRegionDesc: null, // 客户区域
  deliveryAddress: null, // 交付地点 - 合同
  ouName: null, // 签约公司 - 合同
  workTypeDesc: null, // 工作类型 - 合同
  projTempId: null, // 项目模板
  projTempName: null, // 项目模板
  planStartDate: null, // 预计开始日期
  planEndDate: null, // 预计结束日期
  custpaytravelFlag: null, // 客户承担差旅 - 合同
  maxTravelFee: null, // 差旅餐补限额
  currCodeDesc: null, // 币种  - 合同
  remark: null, // 备注
  projStatus: null, // 项目状态
  projStatusDesc: null, // 项目状态
  // createUserId: null, // 创建人
  // createTime: null, // 创建日期
  deliBuName: null, // 交付BU - 合同
  deliResName: null, // 交付负责人 - 合同
  pmResId: null, // 项目经理
  pmResName: null, // 项目经理
  pmEqvaRatio: null, // 项目经理当量系数
  salesmanResName: null, // 销售人员 - 合同
  totalDays: null, // 预计总人天
  totalEqva: null, // 预计总当量
  eqvaPrice: null, // 当量预估单价
  eqvaPriceTotal: null, // 当量预估总价
  totalReimbursement: null, // 费用总预算
  totalCost: null, // 项目预算总成本
  epibolyPermitFlag: null, // 允许使用外包资源
  subcontractPermitFlag: null, // 允许转包
  timesheetPeriodDesc: null, // 工时结算周期
  finishApproveFlag: null, // 活动完工审批
  deposit: null, // 最低保证金（%）
  userdefinedNo: null, // 参考合同号 - 合同
  relatedProjId: null, // 关联项目
  relatedProjName: null, // 关联项目
  performanceDesc: null, // 项目绩效规则
  amt: null, // 含税总金额 - 合同
  taxRate: null, // 税率 - 合同
  effectiveAmt: null, // 有效合同额 - 合同
  closeReasonDesc: null, // 关闭原因
};

export default {
  namespace: 'userProjectQuery',

  state: {
    formData: {
      ...defaultFormData,
    },
    mode: 'create',
    dataSource: [],
    total: 0,
    jumpData: {},
    reportBtn: false,
    pageConfig: {},
  },

  effects: {
    // 查询项目内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findProjectById, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...(datum || {}) },
            dataSource: (datum || {}).reportPlanViews,
            mode: payload.mode,
          },
        });
      }
    },
    // 项目利润报表按钮
    *projectProfitReport({ payload }, { call, put }) {
      const { response } = yield call(queryProjectProfitReport);

      yield put({
        type: 'updateState',
        payload: {
          reportBtn: response.ok,
          jumpData: response.datum || {},
        },
      });
    },
    // 项目执行情况表
    *projExecutionInfo({ payload }, { call, put }) {
      const { response } = yield call(queryProjExecutionInfo);

      yield put({
        type: 'updateState',
        payload: {
          reportBtnProjExecution: response.ok,
          jumpDataProjExecution: response.datum || {},
        },
      });
    },

    // 判断是否可以派发
    *checkDist({ payload }, { call, put }) {
      const { status, response } = yield call(checkDist, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        closeThenGoto(`/user/distribute/create?projId=${payload.id}`);
      } else {
        createMessage({ type: 'error', description: response.reason || '不满足派发条件' });
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        // dispatch({ type: 'clean' });
      });
    },
  },
};
