import router from 'umi/router';
import moment from 'moment';
import { queryContractDetail, queryBusinessInfoUri } from '@/services/user/Contract/sales';
import { create } from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
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
  projectDifficult: null, // 项目难度
  projectImportance: null, // 羡慕重要度
  pmoResId: null,
};

export default {
  namespace: 'userProjectCreate',

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
    // 查询合同内容
    *queryContract({ payload }, { call, put }) {
      const {
        response: { ok, datum = {} },
      } = yield call(queryContractDetail, payload.contractId);
      const {
        response: { ok: ok1, datum: datum1 },
      } = yield call(queryBusinessInfoUri, payload.contractId);
      if (ok || ok1) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              mainContractId: datum ? datum.mainContractId : null,
              contractId: datum ? payload.contractId : null,
              contractNo: datum ? datum.contractNo : null,
              deliveryAddress: datum ? datum.deliveryAddress : null,
              ouName: datum ? datum.ouName : null,
              workTypeDesc: datum ? datum.workTypeDesc : null,
              custpaytravelFlag: datum ? datum.custpaytravelFlag : null,
              currCodeDesc: datum ? datum.currCodeDesc : null,
              deliBuName: datum ? datum.deliBuName : null,
              deliResName: datum ? datum.deliResName : null,
              salesmanResName: datum ? datum.salesmanResName : null,
              userdefinedNo: datum ? datum.userdefinedNo : null,
              amt: datum ? datum.amt : null,
              taxRate: datum ? datum.taxRate : null,
              effectiveAmt: datum ? datum.effectiveAmt : null,
              contractStartDate: datum ? datum.startDate : null,
              contractEndDate: datum ? datum.endDate : null,
              projectDifficult: datum1 ? datum1.projectDifficult : null,
              projectImportance: datum1 ? datum1.projectImportance : null,
              pmoResId: datum ? datum.pmoResId : null,
            },
            mode: payload.mode,
          },
        });
      }
    },
    // 根据子合同id获取商机信息获取项目难度和项目重要度
    // *queryBusiness({ payload }, { call, put }) {
    //   const {
    //     response: { ok, datum = {} },
    //   } = yield call(queryBusinessInfoUri, payload.contractId);
    //   if (ok) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         formData: {
    //           projectDifficult: datum ? datum.projectDifficult : null,
    //           projectImportance: datum ? datum.projectImportance : null,
    //         },
    //       },
    //     });
    //   }
    // },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData, dataSource, deleteKeys } = yield select(
        ({ userProjectCreate }) => userProjectCreate
      );
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },
    // 保存
    *save(_, { call, select }) {
      const { formData, dataSource, deleteKeys } = yield select(
        ({ userProjectCreate }) => userProjectCreate
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
      const { status, response } = yield call(create, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 如果项目是新建状态,自动跳转到派发界面
        if (response.datum.projStatus === 'CREATE') {
          closeThenGoto(`/user/distribute/create?projId=${response.datum.id}`);
        } else {
          closeThenGoto(`/user/project/projectList`);
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
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
