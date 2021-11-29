import moment from 'moment';
import { update, findProjectById } from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { pushFlowTask } from '@/services/gen/flow';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

const defaultFormData = {
  id: null,
  mainContractId: null, // 主合同id
  contractId: null, // 合同id
  projName: null, // 项目名称
  contractNo: null, // 编号 - 合同
  custIdst: null, // 客户行业
  custRegion: null, // 客户区域
  deliveryAddress: null, // 交付地点 - 合同
  ouName: null, // 签约公司 - 合同
  workTypeDesc: null, // 工作类型 - 合同
  projTempId: null, // 项目模板
  planStartDate: null, // 预计开始日期
  planEndDate: null, // 预计结束日期
  custpaytravelFlag: null, // 客户承担差旅 - 合同
  maxTravelFee: null, // 差旅餐补限额
  currCodeDesc: null, // 币种  - 合同
  remark: null, // 备注
  projStatus: null, // 项目状态
  // createUserId: null, // 创建人
  // createTime: null, // 创建日期
  deliBuName: null, // 交付BU - 合同
  deliResName: null, // 交付负责人 - 合同
  pmResId: null, // 项目经理
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
  timesheetPeriod: null, // 工时结算周期
  finishApproveFlag: null, // 活动完工审批
  deposit: null, // 最低保证金（%）
  userdefinedNo: null, // 参考合同号 - 合同
  relatedProjId: null, // 关联项目
  performanceDesc: null, // 项目绩效规则
  amt: null, // 含税总金额 - 合同
  taxRate: null, // 税率 - 合同
  effectiveAmt: null, // 有效合同额 - 合同
  closeReason: null, // 关闭原因
  autoReportFlag: 0, // 自动项目汇报
};

export default {
  namespace: 'userProjectEdit',

  state: {
    formData: {
      ...defaultFormData,
    },
    mode: 'create',
    dataSource: [],
    deleteKeys: [],
    total: 0,
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
            dataSource: (datum || {}).reportPlanViews || [],
            mode: payload.mode,
          },
        });
      }
    },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ userProjectEdit }) => userProjectEdit);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },
    // 保存
    *save(_, { call, select, put }) {
      const { formData, dataSource, deleteKeys } = yield select(
        ({ userProjectEdit }) => userProjectEdit
      );

      if (formData.planEndDate && moment(formData.planEndDate).isBefore(formData.planStartDate)) {
        createMessage({ type: 'error', description: '预计结束日期不应该早于`预计开始日期`' });
        return;
      }
      formData.reportPlanEntityList = dataSource.map(data => {
        if (data.periodDate && data.periodDate.length < 8) {
          // eslint-disable-next-line no-param-reassign
          data.periodDate += '-01';
        }
        return data;
      });
      formData.deleteReportPlans = deleteKeys;
      const { status, response } = yield call(update, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        // 页面从无合同项目申请跳转过来，做对应处理
        const { from } = fromQs();
        if (from && from.includes('noContractProj')) {
          yield put({
            type: 'pushFlowTask',
          });
          return;
        }
        // 页面从其他地方跳转过来，做对应处理
        // 如果项目是新建状态,自动跳转到派发界面
        createMessage({ type: 'success', description: '保存成功' });
        if (response.datum.projStatus === 'CREATE') {
          closeThenGoto(`/user/distribute/create?projId=${response.datum.id}`);
          return;
        }
        closeThenGoto(`/user/project/projectList`);
        return;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
    },
    // 从无合同项目流程跳转过来，保存成功后直接推走流程
    *pushFlowTask({ payload }, { call, put }) {
      const { taskId, from, remark } = fromQs();
      const { status, response } = yield call(pushFlowTask, taskId, { remark, result: 'APPROVED' });
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        const url = from.replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程创建失败' });
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
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...defaultFormData,
          },
          mode: 'create',
          dataSource: [],
          total: 0,
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
    updateForm2(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
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
