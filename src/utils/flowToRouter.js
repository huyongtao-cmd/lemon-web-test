import { stringify } from 'qs';
import { toUrl } from './stringUtils';

export const getUrl = (href = window.location.href) => {
  const urlParams = new URL(href);
  const url = href.substr(urlParams.origin.length);
  return url;
};

/**
 * Map包含：
 * 1个key->key的作用重新定位为流程标识procIden。一个流程标识在不同租户下对应着不同的流程key
 * 根据流程单据来，
 * eg： TSK_S01 对应 线索详情的路由
 * 1个参数
 * - docId 流程跳转到对应详情页的
 */
const flowToRouterMap = {
  TSK_S01: '/sale/management/leadsdetail?id=:docId&page=myleads', // 线索分配流程
  TSK_P01: '/user/distribute/detail?id=:docId', // 派发流程
  ACC_A05: '/plat/saleRece/invBatch/detail?id=:docId', // 合同开票申请与审批
  ACC_A23: '/user/center/travel/detail?id=:docId', // 出差申请审批
  TSK_P03: '/user/task/detail?id=:docId', // 任务包申请流程
  'ACC_A22.SUM': '/plat/intelStl/list/sum/preview?id=:docId', // 当量结算申请流程 -总价
  'ACC_A22.SINGLE': '/plat/intelStl/list/single/preview?id=:docId', // 当量结算申请流程 -单价
  'ACC_A22.COM': '/plat/intelStl/list/common/preview?id=:docId', // 当量结算申请流程 -泛用
  ACC_A19: '/plat/expense/spec/detail?id=:docId', // 特殊费用申请
  ACC_A12: '/plat/expense/normal/view?id=:docId', // 非差旅报销流程
  ACC_A13: '/plat/expense/trip/view?id=:docId', // 差旅报销流程
  ACC_A25: '/plat/expense/spec/view?id=:docId', // 专项报销流程
  ACC_A27: '/plat/expense/particular/view?id=:docId', // 专项报销流程
  TSK_P04: '/user/task/changeview?id=:docId', // 任务包当量调整
  ACC_A24: '/plat/expense/trip/view?id=:docId', // 行政订票报销流程
  ACC_A26: '/plat/expense/computer/apply/detail?id=:docId', // 电脑自购申请流程
  TSK_P07: '/user/task/subpackDetail?id=:docId', // 任务包转包流程
  ACC_A28: '/hr/res/profile/list/resEnroll/detail?id=:docId', // 资源入职申请流程
  ACC_A29: '/user/center/prePay/detail?id=:docId', // 预付款申请流程
  TSK_P08: '/user/task/resActFinishDetail?id=:docId', // 活动完工申请流程
  ACC_A30: '/hr/res/profile/list/OfferAndResDetails?id=:docId', // offer发放及入职流程
  TSK_P09: '/user/project/ProjectReport?id=:docId', // 项目情况汇报流程
  ACC_A31: '/user/leave/index?id=:docId', // 离职流程
  ACC_A32: '/user/center/unfreezeDetail?id=:docId', // 解冻申请流程
  ACC_A33: '/user/center/withdrawDetail?id=:docId', // 提现申请流程
  TSK_S04: '/sale/contract/purchasesDetail?pid=:docId&id=:docId', // 采购合同流程

  ACC_A34: '/sale/contract/invBatches/detail?id=:docId', // 合同开票退回流程
  ACC_A35: '/user/center/myVacation/vacationFlow/index?id=:docId', // 请假流程
  ACC_A36: '/user/job/internal/internalFlow?id=:docId', // 内部推荐流程
  ACC_A37: '/user/project/custExp/detail?id=:docId', // 客户承担费用请款
  ACC_A38: '/plat/expense/withdrawPayFlowView?id=:docId', // 提现付款流程
  ACC_A39: '/sale/contract/sharingFlow?id=:docId', // 子合同利益分配流程
  ACC_A40: '/user/project/finishProject/flow?id=:docId', // 项目结项申请流程
  ACC_A41: '/user/center/InfoDetail?id=:docId', // 个人信息修改流程
  ACC_A42: '/user/probation/probationMid?id=:docId', // 实习期中期考核流程
  ACC_A43: '/user/probation/probationLast?id=:docId', // 实习期末期考核流程
  ACC_A45: '/user/center/prefCheckFlow/index?id=:docId', // 绩效考核流程
  KPI_K01: '/user/performance/performanceTarget/targetEdit?id=:docId', // KPI目标设定流程
  KPI_K02: '/user/performance/performanceFeedback/feedbackEdit?id=:docId', // 年中反馈流程
  KPI_K03: '/user/performance/performanceReport/reportEdit?id=:docId', // 年末报告流程
  KPI_K04: '/user/performance/performanceReport/reportEdit?id=:docId', // 评分公布流程

  ACC_A46: '/hr/res/profile/list/extrApplyflowCreate?id=:docId', // 外部资源引入
  ACC_A47: '/user/Project/noContractProj/flow?id=:docId', // 无合同项目流程
  ACC_A48: '/org/bu/buWithdrawDetail?id=:docId', // BU提现申请流程
  ACC_A49: '/okr/okrMgmt/targetEval/targetResultFlow?id=:docId', // 目标结果打分流程
  ACC_A50: '/plat/intelStl/GeneralAmtSettleDetail?id=:docId', // 合同其他收付计划结算申请流程
  ACC_A51: '/user/project/projectBudgetFlow?id=:docId', // 预算申请流程
  ACC_A52: '/user/project/budgetAppropriationDetail?id=:docId', // 预算拨付流程
  ACC_A53: '/user/center/growth/course?id=:docId', // 申请课程权限
  ACC_A54: '/user/center/growth/certificate/view?id=:docId', // 上传证书
  ACC_A55: '/user/center/growth/checkPoint/view?id=:docId', // 考核点
  ACC_A56: '/user/center/growth/compoundAbility/view?id=:docId', // 复合能力
  ACC_A61: '/user/BaseBUChange/flow?id=:docId', // BaseBU变更流程
  ACC_A63: '/org/bu/buReimbursementList/detail?id=:docId', // BU分摊流程
  ORG_G01: '/okr/okrMgmt/targetMgmt/review?id=:docId', // 目标管理审批流程
  ACC_A57: '/hr/prefMgmt/communicate/communicatePlanFlow?id=:docId', // 绩效考核沟通计划流程
  ACC_A58: '/hr/prefMgmt/communicate/communicateMiddleFlow?id=:docId', // 绩效考核沟通中期流程
  ACC_A59: '/hr/prefMgmt/communicate/communicateResultFlow?id=:docId', // 绩效考核沟通结果流程
  ACC_A65: '/user/project/setUpProject/flow?id=:docId', // 项目立项流程
  ACC_A66: '/plat/expense/transferMoney/flow?id=:docId', // 资金划款流程
  ACC_A64: '/user/project/changeProjectBudget/flow?id=:docId', // 变更预算流程
  TSK_P10: '/user/task/Complete?id=:docId', // 任务包完工申请流程
  ACC_A60: '/plat/purchPay/advanceVerification/view?id=:docId', // 预付款核销流程
  ORG_G02: '/user/changeBase/review?id=:docId', // Base地和社保公积金缴纳地变更流程
  ACC_A62: '/sale/contract/subActiveView?id=:docId', // 子合同激活审批流程

  ACC_A80: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 合同流程
  ACC_A81: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 协议流程
  ACC_A82: '/sale/purchaseContract/prePaymentApply/detail?id=:docId', // 预付款申请流程
  ACC_A83: '/sale/purchaseContract/prePayWriteOff/detail?id=:docId', // 预付款核销申请流程
  ACC_A84: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 薪资流程

  ACC_A86: '/sale/purchaseContract/prePaymentApply/detail?id=:docId', // 投标保证金
  ACC_A87: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 薪资福利结算

  ACC_A85: '/sale/purchaseContract/payRecordList/detail?id=:docId', // 付款记录
  ACC_A90: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:合同采购-服务贸易
  ACC_A91: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:对公资源外包(提点)
  ACC_A92: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:个体资源外包
  ACC_A93: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:对公资源外包
  ACC_A96: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:合同采购-产品贸易
  ACC_A98: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:合同采购-渠道费用
  ACC_A100: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:房屋租赁
  ACC_A101: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:杂项采购
  ACC_A102: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:市场渠道
  ACC_A103: '/sale/purchaseContract/prePayWriteOff/detail?id=:docId', // 付款申请单:预付款核销
  ACC_A104: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:研发采购
  ACC_A105: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:行政运营类采购
  ACC_A107: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:公司管理类
  ACC_A108: '/sale/purchaseContract/paymentApplyList/detail?id=:docId', // 付款申请单:资源赋能类采购
  ACC_A110: '/sale/purchaseContract/prePaymentApply/detail?id=:docId', // 付款申请单:预付款：预付款（产品贸易类）/预付款（服务贸易类）/预付款（其它）

  ACC_A68: '/plat/expense/wageCost/workFlow?id=:docId', // 薪资管理审批流程
  TSK_S05: '/sale/management/customerFlow?id=:docId', // 审批登记为客户详情页
  ACC_A67: '/user/center/growth/compoundPermission/view?id=:docId', // 复合能力权限申请流程
  ACC_A71: '/sale/management/costFlow?id=:docId', // 成本管理审批流程
  ACC_A72: '/sale/management/quoteFlow?id=:docId', // 报价审批流程
  ACC_A73: '/sale/management/benefitFlow?id=:docId', // 利益分配审批流程
  ACC_A74: '/sale/management/channelFlow?id=:docId', // 渠道费用审批流程
  ACC_A70: '/user/task/equivalentFlow?id=:docId', // 当量申请流程
  TSK_P12: '/user/task/splitpack/flow?id=:docId', // 拆包审批流程
  RES_R01: '/plat/adminMgmt/businessCard/approval?id=:docId', // 名片申请审批流程
  ACC_A75: '/user/project/logApprovalDetail?currentMode=detail&demandId=:docId', // 项目日志 需求类型审批

  TSK_S06: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同合同采购类型创建流程
  TSK_S07: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同其他合同类型创建流程
  TSK_S08: '/sale/purchaseContract/Flow?id=:docId&pageMode=change', // 采购合同合同采购类型变更流程
  TSK_S10: '/sale/purchaseContract/Flow?id=:docId&pageMode=change', // 采购合同其他合同类型变更流程
  TSK_S09: '/sale/purchaseContract/Flow?id=:docId&pageMode=over', // 采购合同合同采购类型终止流程
  TSK_S11: '/sale/purchaseContract/Flow?id=:docId&pageMode=over', // 采购合同其他合同类型终止流程
  TSK_S12: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同房屋租赁类型创建流程
  TSK_S13: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同杂项采购类型创建流程
  TSK_S14: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同：合同采购-服务贸易
  TSK_S15: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同：合同采购-产品贸易
  TSK_S17: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同：合同采购-渠道费用
  TSK_S18: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同：市场渠道
  TSK_S19: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同：研发采购
  TSK_S20: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同：行政运营类采购
  TSK_S21: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同：公司管理类
  TSK_S22: '/sale/purchaseContract/Flow?id=:docId&pageMode=purchase', // 采购合同：资源赋能类采购

  ADM_M01: '/plat/adminMgmt/useSealApply/approval?id=:docId', // 用印申请流程
  ADM_M02: '/workTable/contractMgmt/contractCreate/flow?id=:docId', // 台账合同新建审批流程
  ADM_M04: '/workTable/user/myTripApplyDisplay?id=:docId', // 台账合同新建审批流程
  ADM_M06: '/workTable/adm/bookingByAdminDisplay?id=:docId', //行政订票
  ADM_M07: '/workTable/adm/tripManagementClaimDisplay?id=:docId', // 行政订票结算

  BUD_B01: '/workTable/bud/budgetDisplayPage?id=:docId', // 预算流程
  BUD_B02: '/workTable/bud/appropriationDisplayPage?id=:docId', // 预算拨款流程
  BUD_B03: '/workTable/bud/budgetAdjustDisplayPage?id=:docId', // 预算调整流程
  PRO_P13: '/workTable/projectMgmt/projectMgmtList/flow?id=:docId', // 项目审批
  PUR_G01: '/workTable/pur/purchaseDisplayPage?id=:docId', // 采购流程
  PUR_G03: '/workTable/pur/purchaseDisplayPage?flag=CHECK&id=:docId', // 采购流程
  PUR_G02: '/workTable/pur/paymentRequestDisplayPage?id=:docId', // 采购流程
  PUR04: '/workTable/pur/purchaseDisplayPage?id=:docId', // 采购流程
  PUR05: '/workTable/pur/paymentRequestDisplayPage?flag=OTHER&id=:docId', // 采购流程

  COS_S01: '/workTable/cos/regularExpenseDisplay?id=:docId', // 常规报销流程
  COS02: '/workTable/cos/tripExpenseDisplay?id=:docId', // 差旅报销流程
  COS03: '/workTable/cos/welfareExpenseDisplay?id=:docId', // 福利费报销流程
  COS04: '/workTable/cos/loanExpenseDisplay?id=:docId', // 借款核销报销流程
  COS05: '/plat/othersExpense/othersExpenseApply?id=:docId', // 借款核销报销流程
  COS11: '/workTable/cos/loanDisplay?id=:docId', // 借款申请流程
  COS12: '/plat/othersExpense/othersPaymentDisplay?id=:docId', // 其他付款单申请流程
  PRO_P06: '/workTable/projectMgmt/weeklyList/flow?id=:docId', // 周报汇报流程
  SAL01: '/workTable/sale/saleOrder/flow?id=:docId', // 销售单审批流程
  SAL02: '/workTable/sale/collectionPlan/flow?id=:docId', // 收款开票流程
  SAL03: '/workTable/sale/saleOrder/adjust?id=:docId', // 销售单调审批流程

  RES_R04: '/user/center/myVacation/vacationFlow/indexNew?id=:docId', // 休假流程

  USER01: '/hr/resource/informationMove?id=:docId', // 异动流程

  USER02: '/hr/resource/informationAssess?id=:docId', // 试用期考核流程

  USER03: '/hr/resource/informationDimission?id=:docId', // 离职流程
};

/**
 *
 * @param {*} flowKey 就是 flowToRouterMap 的 key
 * @param {*} param1 各种参数
 *
 * - docId 即 flowToRouterMap 的 key 对应 router 的详情 单据 id
 * - id 流程实例 id， 即 procId
 * - taskId 流程节点 id，推动流程节点前进时需要
 * - rest 额外的参数传递
 */
export const flowToRouter = (flowKey, { docId, id, taskId, originalUrl, ...rest }) => {
  if (!flowKey) return '';
  const router = flowToRouterMap[flowKey];
  if (!router) return '';
  // fill in the params
  const restfulRoute = toUrl(router, { docId });
  // add from
  const from = stringify({
    prcId: id,
    taskId,
    ...rest,
    from: originalUrl || window.location.href,
  });
  const restfulRouter = `${restfulRoute}&${from}`;
  return restfulRouter;
};

/**
 * 提交按钮显示：
 * 1.apprStatus 为空或者NOTSUBMIT 时可以显示按钮；
 * 2.apprStatus为REJECTED 或者WITHDRAW ，并且编辑页能拿到taskId参数时
 */

export const showProcBtn = (status, taskId = false) =>
  !status || status === 'NOTSUBMIT' || (taskId && (status === 'REJECTED' || status === 'WITHDRAW'));
