/* API 文件配置
 RESTful definitions:
    - [g:get, p:put, s:patch, d:delete, c:post, h:head]
        ∪ [f:form, j:json, m:multipart, g:graph]
        [g, s, d, h] ∈ idempotent set && [p, u] ∈ changed set
*/
module.exports = {
  basic: {
    captcha: '/sec/pc/captcha', // gf/ 验证码
    xsrf: '/sec/pc/ssrf', // gf/ XSRF检查

    login: '/sec/pc/login', // cf/ 登录 账号|验证码
    loginToken: '/sec/pc/getAutoToken', // get 获取token，用作静默登录
    logout: '/sec/pc/logout', // gf/ 登出
    principal: '/sec/pc/principal', // gf/ 用户上下文
    encryptPsw: '/sec/pc/genPubKey', //  加密公钥获取

    smsCode: '/login/v_code', // cf/ 登录短信校验码
    pwdStr: '/pwd/strength', // gf/ 密码强度
    resetPW: '/pwd/reset', // cf/ 修改密码 - 重制密码
    codeReset: '/pwd/reset/v_code', // cf/ 找回密码 - 短信校验码
    pwdReset: '/pwd/reset', // ij/ 密码重制
    pwdChange: '/pwd/change', // ij/ 密码修改

    lang: '/api/core/lang', // cf/ 切换国际化语言
    sfsX: '/edp/sfs/item/x', // d/ 文件删除

    elarning: '/api/common/v1/sso/url', // get 获取 E-Learning 链接
    reportChart: '/api/common/v1/report/REPORT_PLAT', // get 获取报表链接
    cms: '/api/sys/v1/cms/category/{code}', // get 查询关于我们或者版本信息
  },
  user: {
    flow: {
      todo: '/eds/api/bpm/todo_tasks', // 我的待办
      back: '/eds/api/bpm/back_tasks', // 我的退回
      done: '/eds/api/bpm/done_tasks', // 我的已办
      procs: '/eds/api/bpm/procs/self', // 我的流程检索
      // procs: '/eds/api/bpm/procs', // 我的流程检索
      procsAll: '/eds/api/bpm/procs/all', // 所有流程
      procCancel: '/eds/ops/bpm/procs/:id', // 流程取消
      notify: '/eds/api/bpm/unread_ccs', // 我的知会
      updateNotifyBatch: '/eds/api/bpm/ccs/batchRead/:ids', // 批量完成知会任务
      updateNotify: '/eds/api/bpm/ccs/:id', // 更新知会的状态
      closeFlow: '/eds/api/bpm/proc/close/:prcId', // 更新知会的状态
      getFlowData: '/api/production/flowPanel/getFlowData', //获取新建流程页面配置信息
      listFlowPanel: '/api/production/flowPanel/list', // 获取新建流程页面的列表信息
      save: '/api/production/flowPanel/save', // post 新加流程配置 新增+修改
      findById: '/api/production/flowPanel/findById/:id', // get 新加流程配置 详情查询
      deleteByIds: '/api/production/flowPanel/delete/:ids', // patch 新加流程配置 删除
      partial: '/api/production/flowPanel/partial', // put 指定修改
    },
    center: {
      addressList: '/api/common/v1/res/ab', // g 个人中心的通讯录
      changePwd: '/api/iam/pwd', // 密码修改
      deleteExpense: '/api/base/v1/reim/del/{ids}', // patch

      teamPersonal: '/api/person/v1/myTeam', // get 我的团队
      teamInfo: '/api/person/v1/myTeam/getInfo', // get 查询资源需求数据
      resInfo: '/api/person/v1/myTeam/resPlan/:id', // get 获取当前资源信息
      resPlanList: '/api/person/v1/myTeam/resPlan', // get 获取资源信息
      workingList: '/api/person/v1/myTeam/workReport/:searchYear/:id', // get 获取工作报表
      resAccountInfo: '/api/person/v1/myTeam/ledger/res/:resId', // get 账户信息
      resAccountList: '/api/person/v1/myTeam/ledger/io/res/:resId', // get 账户经营状况查询
      resAccountDetailList: '/api/person/v1/myTeam/ledger/resLedgerIo/:resId', // get 当量记录

      prePayPersonal: '/api/worth/v1/adpay/myList', // get 预付款查询
      prePayAction: '/api/worth/v1/adpay', // post 新增 put 修改
      prePayDetail: '/api/worth/v1/adpay/:id', // get 详情
      particularSelect: '/api/worth/v1/adpay/feeapply', // get 特殊费用申请下拉
      prePayDelete: '/api/worth/v1/adpay/del/:ids', // patch 预付款删除(批量)
      prePayDeplete: '', // put 发起报销冲抵

      ticketMgmtPersonal: '/api/op/v1/tripTickets/tripTicketsMyList', // 行政订票信息
      ticketInfoChange: '/api/op/v1/tripTickets/:id', // 行政订票信息 - 修改票务状态
      vacationList: '/api/person/v1/vacation/myVacationList', // g 我的假期列表

      // 我的成长
      growthInfo: '/api/base/v1/myHavecapaSet', // get 获取我的成长树数据
      capaInfo: '/api/base/v1/mycapaSet', // get 获取复合能力
      capaAttention: '/api/base/v1/myHavecapaSet', // put 关注复合能力
      capaAttentionCancel: '/api/base/v1/myHavecapaSet/concern/:id', // get 取消关注
      leveldInfo: '/api/base/v1/myHavecapaSet/jobAndLevelName/:capasetId/:leveldId/:capasetLevelId', // get 获取级别详情
      leveldDiff: '/api/base/v1/myHavecapaSet/jobAndLevelName/gap', // put 获取级别差
      courseApply: '/api/base/v1/myHavecapaSet/twResCourseApply', // put 课程请求
      getCourseApply: '/api/base/v1/myHavecapaSet/twResCourseApply/:id', // get 获取申请课程详情
      courseApplyHandle: '/api/base/v1/myHavecapaSet/twResCourseApply/pass', // put 培训课程权限处理
      saveCert: '/api/base/v1/myHavecapaSet/resCertApplyIdsEntity', // POST 保存或获取证件申请信息
      getCert: '/api/base/v1/myHavecapaSet/resCertApplyEntity/:id', // get 获取证件申请信息
      applyCert: '/api/base/v1/myHavecapaSet/resCertApplyIdsEntity', // put 提交上传证件申请
      flowCert: '/api/base/v1/myHavecapaSet/resCertApplyEntity/pass', // put 推流程时的保存
      checkPoint: '/api/base/v1/myHavecapaSet/resCapaExamApplyView', // post 保存考核点
      getPoint: '/api/base/v1/myHavecapaSet/resCapaExamApplyView/:id', // get 获取考核点
      savePoint: '/api/base/v1/myHavecapaSet/save/resCapaExamApplyView', // post 保存考核点
      flowPoint: '/api/base/v1/myHavecapaSet/update/resCapaExamApplyView', // post 推流程时的保存
      saveCapaGrowth: '/api/base/v1/myHavecapaSet/resCapasetApplyView', // post 保存复合能力
      getCapa: '/api/base/v1/myHavecapaSet/select/resCapasetApplyEntity/:capaSetId', // get 请求复合能力
      saveCapa: '/api/base/v1/myHavecapaSet/save/resCapasetApplyEntity', // post 复合能力申请保存
      getCapaApplyInfo: '/api/base/v1/myHavecapaSet/select/resCapasetApplyEntity/:id', // get 获取复合能力详情
      flowCapa: '/api/base/v1/myHavecapaSet/updateResult/resCapasetApplyEntity', // post 推流程时的保存
      saveSelfUrl: '/api/person/v1/res/updateResDesc', // 保存自我介绍

      courseApplyList: '/api/base/v1/myCapaList/resCourseApplyList', // 培训课程权限申请记录
      certApplyList: '/api/base/v1/myCapaList/resCertApplyList', // 资格证书上传申请记录
      examApplyList: '/api/base/v1/myCapaList/resCapaExamApplyList', // 考核点审核申请记录
      capaSetApplyList: '/api/base/v1/myCapaList/resCapaSetApplyList', // 能力获取申请记录
      resAccEssApplyList: '/api/base/v1/myCapaList/resAccEssApplyList', // 能力权限申请记录
      selectProj: '/api/base/v1/myCapaList/selectProjByResId', // 能力考核点审核当前用户参与的项目
      selectProjRole: '/api/base/v1/myCapaList/selectProjRoleById/:id', // 能力考核点根据项目查详情
      selectTaskEval: '/api/base/v1/myCapaList/selectTaskEval', // 相关任务

      capaAccEssView: '/api/base/v1/myHavecapaSet/capaAccEssView/:id', // 复合能力权限申请信息查询
      submitCapaAccEssView: '/api/base/v1/myHavecapaSet/capaAccEssView', // post 复合能力权限申请 提交
      capaAccEssViewById: '/api/base/v1/myHavecapaSet/capaAccEssViewById/:id', // 复合能力权限申请流程详情
      capaAccEssViewFlow: '/api/base/v1/myHavecapaSet/update/capaAccEssView', // 复合能力权限申请流程审核

      // 我的培训
      resTrainingProgSelect: '/api/base/v1/resTrainingProg/select/:trnStatus', // 侧栏 培训数据,0 是 待完成培训,1 是 已结束培训
      resTrainingProgDel: '/api/base/v1//resTrainingProg/delete/:ids', // 侧栏 培训数据删除
      resTrainingProgSelTrain: '/api/base/v1/resTrainingProg/selectTrainingProgCourse/:id', // 拉取培训课程

      // 我的赋能 - 考核中能力
      resCapaPost: '/api/base/v1/myHavecapaSet/resCapa/post/:offset/:limit', // 试岗考核中
      resCapaReview: '/api/base/v1/myHavecapaSet/resCapa/review/:offset/:limit', // 待复核
      capaAbility: '/api/base/v1/myHavecapaSet/resCapa/capaAbility', // 试岗考核点
      waitCapaAbility: '/api/base/v1/myHavecapaSet/resCapa/waitCapaAbility', // 待复核 考核点
      saveResTrainingProg: '/api/base/v1/myHavecapaSet/saveResTrainingProg', // 新增项目培训

      // 我的赋能 - 能力晋升
      mycapaSetList: '/api/base/v1/myHavecapaSet', // 我的复核能力
      mycapaSetChecked:
        '/api/base/v1/myHavecapaSet/resCapa/myWaitCapaAbility/:capaSetId/:leveldId/:capaSetLevelId', // 我的复核能力考核点
      resCapaType: '/api/base/v1/myHavecapaSet/resCapa/type', // 我的单项能力分类
      myResCapa: '/api/base/v1/myHavecapaSet/myResCapa/:upperId', // 我的单项能力分类-点击获取考核点
      myFocusResCapa: '/api/base/v1/myHavecapaSet/myFocusResCapa/:upperId', // 我关注的单项能力分类-点击获取考核点
      cancelMyResCapa: '/api/base/v1/myHavecapaSet/cancelMyResCapa/:id', // 取消关注
      saveMyResCapa: '/api/base/v1/myHavecapaSet/saveMyResCapa', // 添加关注
    },
    shortcut: {
      myInfo: '/api/common/v1/myInfo', // 获取首页我的信息
      list: '/api/common/v1/shortCut/my', // 快捷入口
      found: '/api/common/v1/shortCut/my', // 新建
      change: '/api/common/v1/shortCut/changeOrder', // 换顺序
    },
    customShortCut: {
      customShortCut: '/api/production/custShortcut/list', //个人自定义入口列表
      delCustomShortCut: '/api/production/custShortcut/delete/{ids}', //个人自定义入口 删除 patch
      addCustomShortCut: '/api/production/custShortcut/insertNav', //个人自定义入口 新建
      updateSortNoCustomShortCut: '/api/production/custShortcut/updateSortNo/{id}/{sortNo}', //个人自定义入口 修改顺序
      getNavsCustomShortCut: '/api/production/custShortcut/getNavs', //个人自定义入口 获取菜单
      saveNavsCustomShortCut: '/api/production/custShortcut/saveNavs', //个人自定义入口 保存菜单
      noticeListLength: '/api/production/customSetting/byKey/{key}', //系统公告接口
      uploadUserPhoto: '/api/production/sys/userPhoto/uploadUserPhoto/:resId/:attach', //上传用户头像
      queryUserPhoto: '/api/production/sys/userPhoto/queryUserPhoto/:resId', //查询用户头像
    },
    product: {
      cooperativeList: '/api/base/v1/buProd/cooperative', // 找合作伙伴列表
      coopDetail: '/api/base/v1/buProd/coop/:id', // 找合作伙伴详情
      create: '/api/base/v1/theme/save', // 主题新增
      update: '/api/base/v1/theme/update', // 主题的修改
      query: '/api/base/v1/theme/query', // 主题查询
      deleteById: '/api/base/v1/theme/delete/:id', // 主题删除
      themeAbilityCreate: '/api/base/v1/themeAbility/save', // 主题能力新增
      themeAbilityQuery: '/api/base/v1/themeAbility/queryByThemeId/:id', // 根据条件查询主题-能力地图列表
      deleteAbilityById: '/api/base/v1/themeAbility/delete/:id', // 能力地图删除
      themeProcess: '/api/base/v1/themeProcess/queryByThemeId/:id', // 主题流程
      themeProcessUpdate: '/api/base/v1/themeProcess/update/:id', // 主题流程的修改和新增
      queryByReportId: '/api/base/v1/themeReport/queryByReportId/:id', // 主题报表查询
      queryReportData: '/api/base/v1/themeReport/queryReportData/:id', // 主题报表数据查询
      updateReportData: '/api/base/v1/themeReport/updateReportData/:themeId/:reportId/:location', // 主题报表数据更新
      saveReportData: '/api/base/v1/themeReport/saveReportData/:themeId/:location', // 主题报表数据新增
      queryThemeById: '/api/base/v1/theme/query/:id', // 根据id查询主题
    },
    contract: {
      opportunitySelect: '/api/common/v1/select/multi/opportunity', // g 商机下拉
      contractSelect: '/api/common/v1/select/contract', // g 合同下拉
      subContractSelect: '/api/common/v1/select/subContract', // g 合同下拉
      customerSelect: '/api/common/v1/select/customer', // g 客户下拉
      supplierSelect: '/api/common/v1/select/supplier', // g 供应商下拉
      finperiodSelect: '/api/common/v1/select/finperiod', // g 财务期间下拉
      buProductSelect: '/api/common/v1/select/bu/product', // g 产品下拉
      salesRegionBuSelect: '/api/common/v1/select/activeSalesRegionBu', // g 销售区域BU下拉

      mainContractCreate: '/api/op/v1/contract/sales/main', // p 新建销售主合同
      queryContract: '/api/op/v1/contract/sales/:id', // g 销售合同查询 -- 详情
      queryBusinessInfo: '/api/op/v1/contract/sales/businessOpportunities/:id', // 根据子合同id获取商机信息获取项目难度和项目重要度
      editContract: '/api/op/v1/contract/sales', // p 销售合同修改  / g 销售合同查询 -- 列表
      querySubContract: '/api/op/v1/contract/sales/sub/:mainId', // g 销售合同子合同查询 -- 列表
      createSubContract: '/api/op/v1/contract/sales/sub', // p 销售子合同 -- 创建
      purchaseContract: '/api/op/v1/contract/purchase', //  g 采购合同查询 -- 列表 / p 采购合同 -- 创建
      purchaseContractPagenation: '/api/op/v1/contract/purchase/page', //  g 采购合同查询 -- 列表 / p 采购合同 -- 创建 分页
      purchaseSupplier: '/api/common/v1/linkage/contract/purchase/supplier/:supplierId', //  g 采购合同页面 -- 供应商法人联动
      purchaseBu: '/api/common/v1/linkage/contract/purchase/bu/:buId', //  g 采采购合同页面 -- 采购法人联动
      purchaseDetail: '/api/op/v1/contract/purchase/:id', //  g 采购合同 -- 详情
      purchaseEdit: '/api/op/v1/contract/purchase', // put 采购合同 -- 修改
      purchaseActivity: '/api/op/v1/contract/purchase/activity/:id', // put 采购合同 -- 激活
      purchaseClose: '/api/op/v1/contract/purchase/close/:id/:reason', // put 采购合同 -- 激活
      contractListDel: '/api/op/v1/contract/deletePurchase/:ids', // 采购合同 -- 删除

      recvplanListSave: '/api/op/v1/contract/:id/recvplan', // g 合同收款计划查询 -- 列表
      queryRecvplanList: '/api/op/v1/contract/recvplans', // g 合同收款计划查询 -- 列表
      updateStatus: '/api/op/v1/contract/:id/status/:status', // s 销售合同-更新合同状态：激活或者关闭等功能
      recvDistInfo: '/api/worth/v1/profit/initDistInfo/:recvId', // get 根据收款计划获取初始分配信息
      recvDistInfoSave: '/api/worth/v1/profit/save/:recvId', // post 保存分配信息
      getPeriodInfoByDate: '/api/common/v1/getPeriodInfoByDate/:date', // get 根据时间拉取收入核算期间
      recvConfSave: '/api/op/v1/jdeRecvPlanConf/save', // put 保存收款确认信息

      purchasePlan: '/api/op/v1/pcontract/payplans', // get 采购合同付款计划
      purchasePlanPatch: '/api/op/v1/pcontract/payplan/save', // post 批量保存
      purchasePlanPatchD: '/api/op/v1/pcontract/payplans/del/:ids', // patch 批量删除

      // 子合同维护 - 收益分配
      platformProfileList: '/api/base/v1/profitdist/match/{contractId}', // 根据子合同匹配平台利益分配规则
      sharingList: '/api/base/v1/profitAgrees/{contractId}', // 合同利益分配
      otherRecvList: '/api/op/v1/contractOtherRecv/getByContractId/{contractId}', // 其他收付计划
      sharingListSave: '/api/base/v1/profitAgrees/{contractId}',
      otherRecvListSave: '/api/op/v1/contractOtherRecv/otherRecvListSave/{contractId}', // 保存其他收付计划
      getProAgreesByRuleId:
        '/api/base/v1/profitAgree/getProfitAgreesByRuleId/:contractId/:profitRuleId', // 根据合同id、分配规则主数据id获取分配规则
      sharingListReset: '/api/base/v1/profitAgrees/reset/:contractId', // put 恢复默认规则 利益分配
      createSharingListReset: '/api/base/v1/profitAgrees/getDefaultAgree/:contractId', // put 重新生成 利益分配
      sharingListForceReset: '/api/base/v1/profitAgrees/forceReset/:contractId', // put 强行重置 利益分配
      listRemoveContact: '/api/op/v1/contract/del/:ids',
      resetProfitResults: '/api/op/v1/contract/resetProfitResult/:ids', // POST 根据主、子合同id重新生成利益分配数据

      checkCreateProj: '/api/op/v1/contract/check/proj/:id', // 判断子合同是否能创建项目

      recvPlanListPersonal: '/api/op/v1/contract/myRecvplan', // g 合同收款计划查询 -- 列表
      recvPurchasePersonal: '/api/op/v1/pcontract/myPayplans', // g 付款计划查询 -- 列表
      selectRecvPlan: '/api/op/v1/contract/:id/select/recvplan', // 合同收款计划下拉

      approveRetTicket: '/api/worth/v1/invBatchs/approveRetTicket', // 退票流程的通过button  接口

      queryChildContractDetail: '/api/base/v1/profitAgree/getModifyInfoCon/:contractId', // 子合同收益分配详情查询
      queryChildContractFlowDetail: '/api/base/v1/profitAgree/getModifyInfoId/:modifyId', // 子合同收益分配流程详情查询
      startChildContractProc: '/api/base/v1/profitAgrees/startProc', // 子合同收益分配流程发起和审批
      examineByProfitAgree: '/api/bpm/v1/examineByProfitAgree/:taskId', // 子合同收益分配第二节点流程审批
      contractOtherStlApply: '/api/op/v1/contractOtherRecv/startProc/:otherRecv', // 合同其他收付计划 发结算申请

      // 子合同维护->相关费用
      otherFee: '/api/op/v1/contract/otherFee/:id', // 其他相关费用类型UDC
      relatedSub: '/api/op/v1/contract/otherFee/sub/:contractId', // 相关费用新增和修改接口
      otherFeeDetil: '/api/op/v1/contract/otherFeeDetil/:id', // 相关费用支付明细
      contractSales: '/api/op/v1/contract/sales/:id', // 获取财务信息和字段接口

      // 子合同维护 -> 采购需求处理
      procurDemandDetail: '/api/op/v1/contract/procurDemand/:contractId', // 采购需求详情查询
      procurDemandEdit: '/api/op/v1/contract/procurDemand', // 采购需求新增/修改
      insertPurConMan: '/api/op/v1/contract/procurDemand/insertPurConMan', // 生成采购合同

      // 子合同维护 -> 渠道费用确认单
      channelCostConDetail: '/api/op/v1/contract/channelCostCon/:contractId', // 渠道费用确认单详情查询
      channelCostConEdit: '/api/op/v1/contract/channelCostCon', // 渠道费用确认单编辑

      // 子合同详情 - 从销售合同列表创建采购合同
      subDetail: '/api/op/v1/contract/subDetail/:contractId', // 渠道费用确认单编辑

      getNewRuleByContId: '/api/base/v1/profitdist/getNewRuleByContId/:contractId', // 子合同利益分配规则详情（修改页面用）
      saveNewRule: '/api/base/v1/profitdist/saveNewRule', // 子合同利益分配规则修改（修改页面用）

      passAccount: '/api/base/v1/profitdist/passAccount/:contractId', // 泛用结算分配 - 过账操作
      getNormSettleByContId: '/api/base/v1/profitdist/getNormSettleByContId/:contractId', // 泛用结算分配 - 过账操作
      getNewIncomeNormSettleByContId:
        'api/base/v1/profitdist/getNewIncomeNormSettleByContId/:contractId', // 利益分配页面的泛用结算申请单
    },
    travel: {
      // 出差
      list: '/api/op/v1/busitrip/applys', // g 出差申请列表
      travel: '/api/op/v1/busitrip/apply/:id', // g 出差申请单条查询
      travelDels: '/api/op/v1/busitrip/applyd/:id', // g 出差申请明细列表查询
      travelSave: '/api/op/v1/busitrip/apply', // p 出差申请单条保存
      travelsDel: '/api/op/v1/busitrip/delete/:ids', // s 出差申请批量删除

      travelApply: '/api/op/v1/busitrip/appliedt/:id', // c 出差申请保存 - 流程发起
      // travelReApply: '/eds/api/bpm/task/:taskId', // c 出差申请保存 - 流程重新发起

      travelFeeCode: '/api/op/v1/busitrip/selctFeeCode', // get 根据 项目id或任务包id 获取对应费用码

      // 判断编辑按钮是否可以点击
      editBtnStatus: '/api/op/v1/busitrip/allowEdit/:id',
    },
    ability: {
      // 级别
      levelSel: '/api/person/v1/levels/s', // g 级别列表 - 下拉
      levels: '/api/person/v1/levels', // g 级别列表
      level: '/api/person/v1/level/:id', // g 级别详情
      levelSave: '/api/person/v1/level', // p  级别保存
      // 能力支撑
      abilities: '/api/base/v1/abilities', // g 能力支撑查询
      ability: '/api/base/v1/ability/:id', // g 能力支撑详情
      abilitySave: '/api/base/v1/ability', // p 能力支撑保存
      // 能力主数据
      capas: '/api/base/v1/capas', // g 能力查询
      capa: '/api/base/v1/capa/:id', // g 能力详情
      capaSave: '/api/base/v1/capa', // p 能力保存
      // 能力级别
      capaLevelSel: '/api/person/v1/capaLevels/s', // g 能力级别列表 - 下拉
      capaLevelDetSel: '/api/person/v1/capaLevels/s/:id', // g 能力级别列表明细 - 下拉
      capaLevels: '/api/person/v1/capaLevels/:id', // g 能力级别列表
      // 能力级别新
      capaLevelSelNew: '/api/base/v1/capa/level', // get 获取能力级别下拉
      capaLevelDetSelNew: '/api/base/v1/capa/leveld/:id', // get 能力级别列表明细
      capaStatus: '/api/base/v1/capa/:id/:capaStatus', // put 更改能力状态
      capaTree: '/api/base/v1/capas/tree', // get 单项能力添加
      capaTreeDetail: '/api/base/v1/capasByUpTreeId', // get 获取详情细信息
      capaTreeDetailWithText: '/api/base/v1/capasByUpTreeQuery', // get 获取详情细信息
      // 能力支撑维护
      capaAbilities: '/api/base/v1/capaAbilities/:id', // g 能力支撑构成查询
      capaAbilitiesAdd: '/api/base/v1/capaAbilities', // c 能力支撑构成批量新增
      capaAbilitiesDel: '/api/base/v1/capaAbilities/:ids/d', // s 能力支撑构成批量删除
      capaAbilityStat: '/api/base/v1/capaAbility/stat', // s 能力支撑构成修改 - 列表
      // 复合能力主数据
      capaSets: '/api/base/v1/capasets', // g 复合能力列表
      capaSet: '/api/base/v1/capaset/:id', // g 复合能力详情
      capaSetSave: '/api/base/v1/capaset', // p 复合能力保存
      capaSetStatus: '/api/base/v1/capaset/:id/:capasetStatus', // put 更改复合能力能力状态
      // 复合能力级别
      capaSetLevelSel: '/api/base/v1/capasetLevels/s', // g 复合能力级别列表 - 下拉
      capaSetLevels: '/api/base/v1/capasetLevels/:id', // g 复合能力级别列表
      capaSetLevelDetSel: '/api/person/v1/capasetLevels/s/:id', // g 复合能力级别列表明细 - 下拉
      // 复合能力构成维护
      setCapas: '/api/base/v1/capasetCapas/:id', // g 复合能力构成查询
      setCapasAdd: '/api/base/v1/capasetCapas', // c 复合能力构成批量新增
      setCapasDel: '/api/base/v1/capasetCapas/:ids/d', // s 复合能力构成批量删除
      setCapaStat: '/api/base/v1/capasetCapa/stat', // s 复合能力状态修改 - 列表
      choseCourseTree: '/api/base/v1/selectClassAll', // g 选课弹框左边的树
      choseCourseList: '/api/base/v1/selectProgViewAll', // g 选课右边的列表
      getCourseDetail: '/api/base/v1/selectProgViewById/:id', // g 获取课程详情
      getDoubleCheckDetail: '/api/base/v1/capaNameByCapaId/:id', // g 查询考核信息
      saveDoubleCheck: '/api/base/v1/insertResIsToCheck ', // post 保存复核
      getCapaSetDoubleCheck: '/api/base/v1/renewCapaSet/:id', // get 获取复核能力考核信息
      saveCapsSetDoubleCheck: '/api/base/v1/capaSetsResIsToCheck', // post 保存复核能力
      getRenewCapa: '/api/base/v1/renewCapa', // get 获取复核列表
      getRenewCapaDetail: '/api/base/v1/renewCapa/select/:id', // get 获取复核要求列表详情
      cancelRenewCapa: '/api/base/v1/renewCapa/del/:ids', // delete
      getRenewCapaRes: '/api/base/v1/renewCapa/renewCapaRes/:id', // get 获取复核资源列表

      courseTree: '/api/base/v1/trainingClass/entryClassTree', // get 获取分类树
      exchangeSortNo: '/api/base/v1/trainingClass/exchangeSortNo', // patch 上移或下移树
      addAndUpdate: '/api/base/v1/trainingClass/traningSave', // post 新增更新树
      updateState: '/api/base/v1/trainingClass/updateStatus/:id/:classStatus', // patch 更新启用停用状态
      deleteClass: '/api/base/v1/trainingClass/delete/:id', // patch 删除分类
      capaListUdc: '/api/base/v1/trainingProg/capasClassTree', // get 单项能力分类 UDC 下拉
      capaList: '/api/base/v1/trainingProg/capaList', // get 根据 UDC 分类获取单项能力
      capaSetList: '/api/base/v1/trainingProg/capaSetList', // get 复合能力下拉
      courseList: '/api/base/v1/trainingProg/query', // get 培训项目列表查询
      courseDetail: '/api/base/v1/trainingProg/query/:id', // get 根据 ID 获取培训项目详情 新增修改使用
      courseDetailPush: '/api/base/v1/trainingProg/queryPushDtl/:id', // get 推送页面获取培训项目详情
      saveCourse: '/api/base/v1/trainingProg/save', // post 保存更新培训项目详情
      deleteCourse: '/api/base/v1/trainingProg/delete/:ids', // patch 删除培训项目
      pushCourseCapa: '/api/base/v1/trainingProg/queryPushCapaList', //  get 培训项目推送 单项能力分页查询
      pushCourseCapaSet: '/api/base/v1/trainingProg/queryPushCapaSetList', // get 培训项目推动 复合能力分页查询
      detailCourseList: '/api/base/v1/trainingProg/queryTrainingProgCourse', // get 根据条件查询培训课程列表(详情分页查询)
      queryCourse: '/api/base/v1/trainingProg/queryTrainingCourse', // get 查询启用课程的列表（课程选择）
      courseState: '/api/base/v1/trainingProg/updateStatus/:id/:progStatus', // pacth 启用/停用 培训项目
      pushCourse: '/api/base/v1/trainingProg/trainingProgPushSave', // put 培训项目推送保存
      getRes: '/api/base/v1/trainingProg/queryRes', // get 获取资源
      getResType: '/api/base/v1/trainingProg/queryResType', // get 获取资源类型

      capaApprovalHistory: '/api/person/v1/res/capas/apply', // get 能力申请记录
      getCourseList: '/api/base/v1/trainingCoursePage', // get 获取课程列表
      editCourse: '/api/base/v1/updateTrainingCourse', // post 修改课程
      changeCourseStatus: '/api/base/v1/changeTrainingCourse/:id', // post 启用停用培训课程
      deleteCourseApi: '/api/base/v1/delTrainingCourse/:ids', // patch  删除培训课程
      addCourse: '/api/base/v1/addTrainingCourse', // post 添加培训课程
      uploadCourse: '/api/base/v1/trainingCourse/upload', // 导入培训课程
      getResDistCapa: '/api/op/v1/task/getTaskCapa/:resId/:distId', // 获取资源自定任务的单项能力
      getResCapaStatus: '/api/op/v1/task/getTaskCapaStatus', // 获取资源单项能力状态
      saveTaskCapa: '/api/op/v1/task/saveTaskCapa', // 保存指定任务需要的单项能力
      getResCapaSet: '/api/person/v1/res/capasets', // 获取资源复合能力
      taskCapa: '/api/base/v1/myHavecapaSet/needCapa', // 任务包能力要求
    },
    task: {
      userTask: '/api/op/v1/taskManager/task/:id', // g 任务详情

      userTasks: '/api/op/v1/taskManager/tasks', // g 任务查询
      userTaskAdd: '/api/op/v1/taskManager/task', // c 任务新增
      userTaskSave: '/api/op/v1/taskManager/task', // p 任务新增
      userTasksDel: '/api/op/v1/taskManager/task/del/:ids', // s 任务批量删除
      userTaskBus: '/api/op/v1/taskManager/reasonList/bu', // g 事由号-bu列表
      userTaskProjs: '/api/op/v1/taskManager/reasonList/project', // g 事由号-项目列表
      userTaskPreSales: '/api/op/v1/taskManager/reasonList/preSale', // g 事由号-售前列表
      // userTaskActs: '/api/op/v1/taskManager/activities', // g 活动列表
      userTaskRess: '/api/op/v1/taskManager/getReceptionResourceList', // g 资源列表
      userTaskPorjActs: '/api/op/v1/taskManager/getActivityList/:id', // g 项目活动列表
      userTaskLevelds: '/api/op/v1/taskManager/getLeveldList', // g 复合能力级别列表
      userTaskBuSettles: '/api/op/v1/taskManager/buSettlePrice', // g BU结算价
      userTaskApply: '/api/op/v1/taskManager/task/apply', // 任务包申请
      selectBuByResId: '/api/common/v1/select/baseBu/:resId', // 根据资源id查找当前bu
      userTaskApplyById: '/api/op/v1/taskManager/task/apply/:id', // 任务包申请详情
      userTaskApplySubmit: '/api/op/v1/taskApply/proc/start/:id', // 任务包申请流程提交
      capasetDefault: '/api/base/v1/capaset/default', // 获取当前登录人的默认能力

      userTaskSettle: '/api/op/v1/taskManager/getPrice', // get 计算任务包的各种价格(BU结算价,当量收入)

      originatedTasks: '/api/op/v1/taskManager/myTasks', // g 发起任务
      taskReopen: '/api/op/v1/taskManager/reOpen/:id', // s 取消暂挂/重新打开
      tasksProc: '/api/op/v1/taskManager/processTask/:id', // s 处理任务
      tasksClose: '/api/op/v1/taskManager/closeTask/:id', // s 关闭任务
      taskDist: '/api/op/v1/taskManager/distributedTask/:id', // s 派发任务
      taskPend: '/api/op/v1/taskManager/pendingTask/:id', // s 暂挂任务

      receivedTasks: '/api/op/v1/taskManager/myTasks/accept', // g 接收任务
      startResAct: '/api/op/v1/project/actRes/start/:id', // 开始项目活动
      finishResAct: '/api/op/v1/project/actRes/finish', // 完工项目活动
      receivedTaskSplit: '/api/op/v1/taskManager/splitTask/:id', // g 转包详情
      receivedTaskSplitAdd: '/api/op/v1/taskManager/splitTask', // c 发起转包任务
      receivedTaskActSt: '/api/op/v1/taskManager/updateActivityStatus/:resId', // s 开始活动
      receivedSubpack: '/api/op/v1/taskManager/task/transfer', // put 发起转包申请
      subpackProcess: '/api/op/v1/taskTransfer/proc/start/:id', // post 发起转包流程
      receivedSubpackDetail: '/api/op/v1/taskManager/task/transfer/:id', // post 转包详情
      receivedBuSubpackDetail: '/api/op/v1/taskManager/task/transfer/bu/:id', // 到bu负责人节点时获取的详情
      completeProc: '/api/op/v1/taskManager/startCompleteProc/:taskId', // post 发起任务包完工申请流程
      checkTaskEqvaByTaskId: '/api/op/v1/taskManager/checkTaskEqva/:id', // 校验任务包的当量是否已经全部结算

      taskChange: '/api/op/v1/taskManager/task/change', // 任务包当量变更
      taskChangeStart: '/api/op/v1/taskChange/proc/start/:id', // 任务包当量变更流程提交
      taskChangeDetails: '/api/op/v1/taskManager/task/change/:changeId', // 任务包当量变更明细查询
      taskChangeHistory: '/api/op/v1/taskManager/task/change/list', // 任务包当量变更历史列表

      taskEvents: '/api/op/v1/taskManager/task/events', // g 事件查询
      selectActivityById: '/api/op/v1/taskManager/activity/:id', // g 根据资源活动id查询
      procActivityFinishApply: '/api/op/v1/actFinishApply/proc/start', // 活动完工申请

      taskTmplCreateUri: '/api/op/v1/task_tmpl', // post 创建任务模板
      taskTmplModifyUri: '/api/op/v1/task_tmpl', // put 修改任务模板
      taskTmplDetailUri: '/api/op/v1/task_tmpl/:id', // get 任务模板详情
      taskTmplListPagingUri: '/api/op/v1/task_tmpl', // get 任务模板列表
      taskTmplLogicalDeleteUri: '/api/op/v1/task_tmpl', // patch 任务模板 逻辑删除

      taskMultiCreateUri: '/api/op/v1/task_multi', // post 创建指派
      taskMultiModifyUri: '/api/op/v1/task_multi', // put 修改指派
      taskMultiDetailUri: '/api/op/v1/task_multi/:id', // get 指派详情
      taskMultiListPagingUri: '/api/op/v1/task_multi', // get 指派列表
      taskMultiLogicalDeleteUri: '/api/op/v1/task_multi', // patch 指派 逻辑删除
      findTaskCompByCompId: '/api/op/v1/taskManager/findTaskComp/:compId', // get 根据任务包完成申请表id获取任务详情

      equivalentCreateUri: '/api/base/v1/eqva_applyfor', // 当量申请新增和修改
      equivalentDetailUri: '/api/base/v1/eqva_applyfor/:id', // 当量申请详情
      queryTaskDetailUri: '/api/base/v1/eqva_applyfor/settlement/:id', // 当量申请流程的任务包结算页面
      queryModalDetail: '/api/base/v1/eqva_applyfor/ledger', // 结算预览弹窗
      disterUserPassUri: '/api/base/v1/eqva_applyfor/settlement', // 原发包人通过或决拒绝
      queryCapasetLevelUri: '/api/base/v1/eqva_applyfor/capasetLevel/:resId', // 根据resI的查询复合能力
      // equivalentCreateUri:'/api/base/v1/eqva_applyfor',   // 当量申请新增和修改
      // equivalentDetailUri:'/api/base/v1/eqva_applyfor/:id',   // 当量申请详情

      taskSplit: '/api/op/v1/task_split/task/:id', // 查询任务包信息
      taskSplitActivity: '/api/op/v1/task_split/activity/:id', // 查询任务资源活动信息
      taskSplitOther: '/api/op/v1/task_split/task/other', // 查询其它转包信息
      taskSplitAdd: '/api/op/v1/task_split/task', // 新增拆包
      taskSplitById: '/api/op/v1/task_split/:id', // 根据拆包ID查询拆包信息
      taskSplitEdit: '/api/op/v1/task_split/splits', // 根据拆包ID查询本次拆包信息
      taskSplitSettle: '/api/op/v1/task_split/settle', // 根据拆包ID查询结算信息
      capasetLevelById: '/api/common/v1/select/capasetLevel/:resId', // 根据资源ID查询其复合能力
      doQueryByLogIds: '/api/op/v1/projectLog/task/:ids', // 根据ids 查询项目日志信息 生成任务包
      doUpdateProjectByLogIds: '/api/op/v1/projectLog/eqva/:ids', // 根据ids 查询项目日志信息 当量调整
      doProjectLogApproved: '/eds/api/bpm/tasks/:id', // 项目日志审批
      findIdByTaskNo: '/api/op/v1/task/findIdByTaskNo/:taskNo', // 根据任务编号获取任务id；主要用户获取本租户下无任务的id
      getNoById: '/api/op/v1/task/getTaskNoById/:taskId', // 根据任务id获取任务编号。用来判断是否是无任务
    },
    timesheet: {
      timesheets: '/api/op/v1/timesheets', // g 查询工时列表
      timesheetAdminApproval: '/api/op/v1/timesheets/creditExpert/:ids', // 工时高级审批
      myTimesheets: '/api/op/v1/timesheets/self', // g 我的工时
      lastweekTimesheets: '/api/op/v1/timesheets/lastweek/:weekStart', // g 获取上周 工时数据
      timesheetSave: '/api/op/v1/timesheets/save', // c 批量保存工时
      timesheetDel: '/api/op/v1/timesheets/del/:ids', // c 批量删除工时
      projList: '/api/op/v1/projects/timesheet', // g 选项弹出框 展示项目列表
      selectTask: '/api/op/v1/tasks/timesheet', // g 根据项目查询任务包
      selectActivity: '/api/op/v1/tasks/timesheet/activity/:taskId', // g 根据任务包查询活动
      timesheetAsWeek: '/api/op/v1/timesheets-group', // 审批列表(按周)
      timesheetsDetail: '/api/op/v1/timesheets/items', // g 查询 审批列表(明细)
      approvedTimesheet: '/api/op/v1/timesheets/approved/:ids', // 审批工时通过
      canceledTimesheet: '/api/op/v1/timesheets/cancel-approved/:ids', // 取消审批通过
      rejectedTimesheet: '/api/op/v1/timesheets/rejected/:ids', // 审批拒绝
      revokedTimesheet: '/api/op/v1//timesheets/revoked/:ids', // 创建人撤回工时
      willApproveCount: '/api/op/v1/timesheetsCount', // g 待审批工时数量
      jdeTimesheetReport: '/api/op/v1/jdeTimesheetReport', // g jde工时报表
      recentWork: '/api/common/v1/recent/work', // g 近期工作提醒
    },
    // management 线索及商机管理
    management: {
      leads: '/api/op/v1/leads', // 线索管理查询/新增
      lead: '/api/op/v1/leads/:id', // 线索管理查询单条信息
      leadClose: '/api/op/v1/leads/status', // 线索关闭原因
      leadFinish: '/api/op/v1/leads/finish', // 点击领奖结束流程
      opportunities: '/api/op/v1/oppos', // 商机查询
      opportunitie: '/api/op/v1/oppos/:id', // 商机单条信息查询
      oppoCases: '/api/op/v1/oppo/analyzes', // 商机案情分析查询
      oppoCaseSave: '/api/op/v1/oppo/analyzes/save', // 商机案情分析保存
      oppoCompes: '/api/op/v1/oppo/compes', // 商机竞争对手
      oppoCompeSave: '/api/op/v1/oppo/compes/save',
      oppoExtrafees: '/api/op/v1/oppo/extrafees',
      oppoExtrafeeSave: '/api/op/v1/oppo/extrafees/save',
      oppoPartners: '/api/op/v1/oppo/partners', // 合作伙伴
      oppoPartnerSave: '/api/op/v1/oppo/partners/save',
      oppoSalelists: '/api/op/v1/oppo/salelists',
      oppoSaleSave: '/api/op/v1/oppo/salelists/save', // 商机
      oppoShs: '/api/op/v1/shs', // 商机干系人查询
      oppoShSave: '/api/op/v1/shs/save', // 商机干系人保存
      oppoPending: '/api/op/v1/oppos/status/:id/pending', // 商机暂挂
      oppoActive: '/api/op/v1/oppos/status/:id/active', // 商机激活
      oppoCloseReason: '/api/op/v1/oppos/status/:id/:reason', // 商机关闭及原因
      oppoCategory: '/api/op/v1/oppos/cat', // 商机类别码
      oppoOpen: '/api/op/v1/oppos/open/:id', // 重新打开已关闭商机
      // ================成本估算=================
      costeSave: '/api/op/v1/oppo/coste/save', // 成本估算新增
      costeDel: '/api/op/v1/oppo/coste/delete/:ids', // 成本估算列表删除
      costeUpdate: '/api/op/v1/oppo/coste/update', // 成本估算保存
      costeList: '/api/op/v1/oppo/coste/select/:id', // 成本估算列表
      updateStatus: '/api/op/v1/oppo/coste/updateStatus/:id/:state/:oppoId', // 成本估算列表
      saveFlow: '/api/op/v1/oppo/coste/saveFlow', // 启流程接口
      saveFlowDetail: '/api/op/v1/oppo/coste/selectFlow/:id', // 流程詳情
      costePass: '/api/op/v1/oppo/coste/pass', // 多人审批节点通过
      // ================利益分配================
      benefitSave: '/api/op/v1/oppo/benefit/save', // 利益分配新增
      benefitList: '/api/op/v1/oppo/benefit/select/:id', // 利益分配列表查询
      benefitDel: '/api/op/v1/oppo/benefit/delete/:ids', // 利益分配删除
      benefitUpdateStatus: '/api/op/v1/oppo/benefit/updateStatus/:id/:state/:oppoId', // 利益分配修改激活状态
      benefitFlowDetail: '/api/op/v1/oppo/benefit/selectFlow/:id', // 利益分配流程详情
      benefitSaveFlow: '/api/op/v1/oppo/benefit/saveFlow', // 利益分配起流程
      benefitPass: '/api/op/v1/oppo/benefit/pass', // 多人审批节点通过
      // ================渠道费用================
      channelSave: '/api/op/v1/oppo/channel/save', // 渠道费用新增/修改
      channelList: '/api/op/v1/oppo/channel/select/:id', // 渠道费用列表查询
      channelDel: '/api/op/v1/oppo/channel/delete/:ids', // 渠道费用列表删除
      channelUpdateState: '/api/op/v1/oppo/channel/updateStatus/:id/:state/:oppoId', // 渠道费用列表修改激活状态
      channelFlowDetail: '/api/op/v1/oppo/channel/selectFlow/:id', // 渠道费用流程详情
      channelSaveFlow: '/api/op/v1/oppo/channel/saveFlow', // 渠道费用起流程
      channelPass: '/api/op/v1/oppo/channel/pass', // 多人审批节点通过
      // 报价
      getCosteId: '/api/op/v1/oppo/offer/coste/select/:id', // 获取已激活成本估算规则Id
      offerSave: '/api/op/v1/oppo/offer/save', // 报价新增/修改
      offerList: '/api/op/v1/oppo/offer/select/:id', // 报价列表
      offerDel: '/api/op/v1/oppo/offer/delete/:ids', // 报价列表删除
      offerUpdate: '/api/op/v1/oppo/offer/update', // 报价列表更新保存
      offerUpdateStatus: '/api/op/v1/oppo/offer/updateStatus/:id/:state/:oppoId', // 报价列表改变激活状态
      updateOfferlStatus: '/api/op/v1/oppo/offer/updateOfferlStatus/:id/:state/:oppoId', // 改变已报客户状态
      offerFlowDetail: '/api/op/v1/oppo/offer/selectFlow/:id', // 报价流程详情
      offerSaveFlow: '/api/op/v1/oppo/offer/saveFlow', // 报价起流程
      offerPass: '/api/op/v1/oppo/offer/pass', // 多人审批节点通过
    },
    customer: {
      customerList: '/api/person/v1/newCust/findNewCustList', // 潜在客户列表
      changeDist: '/api/person/v1/newCust/updateNewCust/:ids', // 更改派遣人
      customerDetails: '/api/person/v1/newCust/seleteById/:id', // 潜在客户详情
      customerSave: '/api/person/v1/newCust/saveNewCust', // 新增潜在客户
      seletePicById: '/api/person/v1/newCust/seletePicById/:id', // 销售负责人获取销售VP
      customerFuzzyList: '/api/person/v1/newCust/findRepetitionCustList', // 潜在客户模糊查询接口
      signInvalid: '/api/person/v1/newCust/updateRepetition/:ids', // 潜在客户标记无效
      customerUpload: '/api/person/v1/newCust/upload', // 导入潜在客户excel文件
    },
    project: {
      projects: '/api/op/v1/projects', //  项目列表
      myProjects: '/api/op/v1/myProjects', //  我的项目列表
      projectSave: '/api/op/v1/project', //  项目新增/编辑
      project: '/api/op/v1/project/:id', //  项目详情
      projectSimple: '/api/op/v1/project/simple/:id', //  项目详情简化版
      projectTmplSelect: '/api/common/v1/select/project/tmpl', //  项目模板下拉
      projectSelect: '/api/common/v1/select/project', //  项目下拉
      projectSelectConditional: '/api/common/v1/conditional/select/projects', //  项目条件下拉
      projectSh: '/api/op/v1/project/sh', //  项目成员列表/新增/编辑
      projectShTree: '/api/op/v1/project/sh/tree', //  项目成员列表/新增/编辑
      projectShList: '/api/op/v1/project/sh/list', //  项目成员列表/新增/编辑
      projectShDel: '/api/op/v1/project/sh/del/:ids', //  项目成员删除
      projectActivitys: '/api/op/v1/project/:projId/actProc', //  项目活动列表/新增/编辑/删除
      workbenchProjectActivitys: '/api/op/v1/project/:projId/workbench/actProc', //  项目工作台活动列表
      workbenchTaskRes: '/api/op/v1/taskManager/workbench/res', //  项目工作台资源任务包
      workbenchTaskResComprehensive: '/api/op/v1/taskManager/workbench/res/comprehensive', //  项目工作台资源任务包
      workbenchProfile: '/api/op/v1/project/workbench/profile/:projId',
      totalDistedAndSettledEqvq: '/api/op/v1/project/:projId/workbench/totalDistedAndSettledEqvq', //  项目工作台特殊结算任务汇总
      resPlanning: '/api/op/v1/planning', // 项目资源计划
      resPlanningById: '/api/op/v1//planning/:id', // 项目资源计划详情
      templateResPlanningList: '/api/op/v1/res_planning_template', // 项目资源规划的商机模板管理列表
      templateResPlanningUpdate: '/api/op/v1/res_planning_template', // 项目资源规划的商机模板管理新增，修改
      templateResPlanningDetail: '/api/op/v1/planningTemplate/:id', // 项目资源规划的商机模板管理详情
      businessResPlanningDetail: '/api/op/v1/planning/opportunity/:id', // 项目资源规划的从商机导入
      templateResPlanningDelete: '/api/op/v1/res_planning_template/:ids', // 项目资源规划的商机模板管理删除
      resPlanningHistory: '/api/op/v1/planning/history', // 项目资源计划历史版本/新增
      feeBudget: '/api/op/v1/project/feebudget/:projId', // 项目费用预算
      feeBudgetById: '/api/op/v1/project/feebudget/id/:id', // 项目费用预算
      feeBudgetTemplateTree: '/api/op/v1/project/feebudget/tree/:projId', // 项目预算科目模板
      feeBudgetSave: '/api/op/v1/project/feebudget', // 项目费用预算编辑
      ledgerIoByProj: '/api/org/v1/ledger/projLedgerIo/:projId', // 项目当量交易记录
      projectLedger: '/api/org/v1/ledger/proj/:projId', // 项目账户
      projectLedgerIo: '/api/org/v1/ledger/io/proj/:projId', // 项目账户 - 台账

      abstractChangeDetailByProjId: '/api/sys/v1/business_change/doc/type', // 预算变更的抽象变更功能通过项目id查询
      abstractChangeDetailById: '/api/sys/v1/business_change/:id', // 预算变更的抽象变更功能通过流程地址栏的id查询
      abstractChangeDetailUpdate: '/api/sys/v1/business/change', // 预算变更的抽象变更功能变更意见修改
      changeBudgetByProjId: '/api/op/v1/project/feebudget/businessChange/:projId', // 流程中的修改按钮  根据项目id查询相对应的预算
      createChangeBudgetByProjId: '/api/op/v1/project/feebudget/businessChange/submit/:projId', // 变更预算按钮   根据项目id查询相对应的预算
      changeBudgetSave: '/api/op/v1/project/feebudget/businessChange', // 变更预算点击保存创建流程
      ChangeBudgetHistoryList: '/api/sys/v1/business_change/projBudget', // 预算变更历史列表

      projectExpenseInfo: '/api/op/v1/project/budgetInfo/:reasonId', // get 获取预算信息
      projectExpenseList: '/api/op/v1/project/reimInfo', // get 拉去项目报销列表
      projectProfitReport: '/api/common/v1/report/ProjectProfitReport', // get 项目利润报表
      projExecutionInfo: '/api/common/v1/report/ProjExecutionInfo', // get 项目利润报表
      projDaysEqvaMonthly: '/api/common/v1/report/ProjDaysEqvaMonthly', // get 人天当量统计表
      projReim: '/api/common/v1/report/ProjReim', // get 费用统计表
      projDaysEqvaDaily: '/api/common/v1/report/ProjDaysEqvaDaily', // get 费用人天分析表
      projReimDetail: '/api/common/v1/report/ProjReimDetail', // get 费用明细表
      projTimeSheetDetail: '/api/common/v1/report/ProjTimeSheetDetail', // get 工时明细表
      projPurchaseContractDetail: '/api/common/v1/report/ProjPurchaseContractDetail', // get 采购合同明细表

      getReportApi: '/api/common/v1/report/REPORT_SSO', // get 获取报表登录api
      getReportAjax: '/api/common/v1/report/REPORT_FINEREPORT', // get 获取报表登录插件
      briefInfo: '/api/op/v1/proj_brief/info/:projId', // get 项目汇报获取信息
      briefInfoCreate: '/api/op/v1/proj_brief', // post 创建-项目汇报
      briefInfoModify: '/api/op/v1/proj_brief', // put 修改-项目汇报
      briefInfoListPaging: '/api/op/v1/proj_brief', // get 分页列表-项目汇报
      briefInfoLogicalDelete: '/api/op/v1/proj_brief', // patch 逻辑删除-项目汇报
      briefInfoLogicalDetail: '/api/op/v1/proj_brief/:id', // patch 详情-项目汇报
      briefInfoProcStart: '/api/op/v1/proj_brief/procStart/:id', // get 启动项目汇报流程
      projectLaborUpload: '/api/op/v1/projectLabor/upload', // post 上传项目成本

      distInfoProject: '/api/worth/v1/profit/initDistInfoBri/:briefId', // get 收益计划数据初始化 项目入口
      distInfoProjectSave: '/api/worth/v1/profit/saveBri', // post 收益分配保存 项目入口

      projectTemplateCreate: '/api/op/v1/proj/tmpls', // post 创建-项目模板
      projectTemplateModify: '/api/op/v1/proj/tmpls', // put 修改-项目模板
      projectTemplateListPaging: '/api/op/v1/proj/proj_tmpl', // get 分页列表-项目模板
      projectTemplateLogicalDelete: '/api/op/v1/proj/tmpl/del/:ids', // patch 逻辑删除-项目模板
      projectTemplateDetail: '/api/op/v1/proj/proj_tmpl/:id', // patch 详情-项目模板
      projectTemplateToggleEnabled: '/api/op/v1/proj/tmpls/ef', // put 切换启用-项目模板

      custExpList: '/api/base/v1/reim/costList', // g 客户承担费用列表
      custExpDetail: '/api/base/v1/reim/costreim/:ids/:id', // g 客户承担费用详情
      custExpSaveForm: '/api/base/v1/reim/saveCustExpApply', // g 客户承担费用保存表单
      custExpDetailById: '/api/base/v1/reim/costreimById/:id', // g 客户承担费用详情
      custExpSyncInfo: '/api/base/v1/reim/DataSynchronization', // g 同步客户请款信息状态
      custExpCancel: '/api/base/v1/reim/updateExpenseType/:reimId', // put 取消费用承担
      custExpUpdateRecv: '/api/base/v1/reim/updateCustRecv', // put 手工收款补录

      phaseSettleListFindTimeSheetUri: '/api/op/v1/phase_settle_list/tsList', // get 阶段结算单 查询工时
      phaseSettleListCreateUri: '/api/op/v1/phase_settle_list', // post 创建-阶段结算单
      phaseSettleListModifyUri: '/api/op/v1/phase_settle_list', // put 修改-阶段结算单
      phaseSettleListListPagingUri: '/api/op/v1/phase_settle_list', // get 分页列表-阶段结算单
      phaseSettleListLogicalDeleteUri: '/api/op/v1/phase_settle_list/:ids', // patch 逻辑删除-阶段结算单
      phaseSettleListDetailUri: '/api/op/v1/phase_settle_list/:id', // patch 详情-阶段结算单

      // 项目劳务成本
      projectLaborCreateUri: '/api/op/v1/project_labor', // post 创建项目劳务成本
      projectLaborModifyUri: '/api/op/v1/project_labor', // put 修改项目劳务成本
      projectLaborDetailUri: '/api/op/v1/project_labor/:id', // get 项目劳务成本详情
      projectLaborListPagingUri: '/api/op/v1/project_labor', // get 项目劳务成本列表
      projectLaborLogicalDeleteUri: '/api/op/v1/project_labor', // patch 项目劳务成本 逻辑删除

      // 项目结项
      projClosureApplySave: '/api/person/v1/projClosureApply/save', // 结项申请保存、修改、起流程、推流程
      projClosureApplyList: '/api/person/v1/projClosureApply/list', // 结项申请列表
      projClosureApplyDetails: '/api/person/v1/projClosureApply/:id', // 结项申请详情
      projClosureApplyDelete: '/api/person/v1/projClosureApply/delete/:ids', // 结项申请删除
      pmProject: '/api/common/v1/select/pmProject', // 项目下拉(仅项目经理看自己的项目)
      getResultsByProj: '/api/person/v1/checkresult/getResultsByProj/:projId/:chkClass', // 根据项目id获取 项目结项流程检查事项及结果
      checkresultSave: '/api/person/v1/checkresult/save', // 检查结果的保存
      checkresult: '/api/person/v1/checkresult/list/:id', // 拉取项目结项流程检查事项及结果
      evalInfo: '/api/person/v1/projClosureApply/getEvalInfoBySourceId/:id/:evalType', // 获取项目成员评价信息
      evalSave: '/api/base/v1/eval/saveEvals', // 保存评价信息
      getPoint: '/api/base/v1/eval/getPoint', // 销售、领导对项目经理评价信息获取评价点信息
      projResSelect: '/api/person/v1/extrwork/projres/:projId', // g 查询项目成员
      getAllExtrwork: '/api/person/v1/extrwork/all', // g 查询加班列表
      getExtrworkDetail: '/api/person/v1/extrwork/:id', // g 查询加班详情
      extrworkDel: '/api/person/v1/extrwork/:ids', // del 删除加班
      extrworkSave: '/api/person/v1/extrwork', // put 保存&修改加班
      extrworkFlag: '/api/person/v1/extrwork/timesheetEntity', // g 加班标识是否显示
      myExtrwork: '/api/person/v1/extrwork/allResId', // g 我的加班列表
      ExtrworkByResId: '/api/person/v1/extrwork/allByResId', // g 我的加班列表(传入ResId，根据resId获取，否则，根据当前登陆人resid获取信息)
      extrworkRecentwork: '/api/person/v1/extrwork/NoticeWorkStatus/:id', // g 修改通知状态
      extrworkVacation: '/api/person/v1/extrwork/vacation/:startDate/:endDate', // g 修改通知状态
      extrworkCanEdit: '/api/person/v1/extrwork/updateExtrwork/:id', // g 修改通知状态
      extrworkCheck: '/api/person/v1/extrwork/restChk/:id', // 检查资源是否加班有调休
      addVacation: '/api/person/v1/extrwork/addVacation', // post 安排调休

      // 无合同项目
      noContractList: '/api/op/v1/project/noContract/select', // 无合同项目列表
      noContractDetail: '/api/op/v1/project/noContract/:id', // 无合同项目详情
      noContractFlow: '/api/op/v1/project/noContract', // 无合同项目流程发起和审批

      budgetAppropriationCreateUri: '/api/op/v1/budget_appropriation', // post 创建预算拨付页面
      budgetAppropriationModifyUri: '/api/op/v1/budget_appropriation', // put 修改预算拨付页面
      budgetAppropriationDetailUri: '/api/op/v1/budget_appropriation/:id', // get 预算拨付页面详情
      budgetAppropriationListPagingUri: '/api/op/v1/budget_appropriation', // get 预算拨付页面列表
      budgetAppropriationLogicalDeleteUri: '/api/op/v1/budget_appropriation', // patch 预算拨付页面 逻辑删除
      budgetCompareUri: '/api/op/v1/project/feebudget/compare/:projId', // get 预实对比
      closeAccounting: '/api/person/v1/projectClosingAcc/:projectId', // put 项目关账

      // 项目立项
      setUpProjectListUri: '/api/op/v1/project/request', // 项目立项列表
      setUpProjectCreateUri: '/api/op/v1/project/request', // 项目立项申请
      setUpProjectCreateDetail: '/api/op/v1/project/request/:id', // 项目立项申请的详情
      setUpProjectBUCreateUri: '/api/op/v1/project/request/subContractProject', // 交付BU环节，BU创建
      setUpProjectBUDetailUri: '/api/op/v1/project/request/select/subProjectRequest/:id', // bu负责人的项目立项申请信息
      contractSourceUri: '/api/op/v1/project/request/select/subContract', // 根据选择的交付BU id查询相关子合同下拉
      contractSourceDetailUri: '/api/op/v1/contract/sales/:id', // 根据选择的相关子合同查找详情
      setUpProjectSalesManCreateUri: '/api/op/v1/project/request/salesman/save', // 销售负责人点击通过按钮
      setUpProjectPmoCreateUri: '/api/op/v1/project/request/pmo/save', // pmo点击通过按钮
      setUpProjectProjManagerCreateUri: '/api/op/v1/project/request/pro/save', // 项目经理点击通过按钮
      setUpProjectListDeleteUri: '/api/op/v1/project/request/:ids', // 列表的删除

      // 项目日志列表
      projectLogList: '/api/op/v1/projectLog', // 项目日志列表查询
      doDeleteProjectLogs: '/api/op/v1/projectLog/del/:ids', // 删除项目日志
      doCreateProjectLog: '/api/op/v1/projectLog', // 新增项目日志
      doGetProjectLogById: '/api/op/v1/projectLog/:id', // 根据ID查找项目日志详情
      doGetProjectLogByDemandId: '/api/op/v1/projectLog/demand/:id', // 根据审批ID查找项目日志详情
      doGetQuestionInfoById: '/api/op/v1/projectLog/problem/:id', // 根据问题反馈ID查找详情
      doGetProjectChangeLogList: '/api/op/v1/projectLog/history', // 根据项目日志ID查找历史修改记录信息
      doGetProjectRecordList: '/api/op/v1/projectLog/trace', // 根据项目日志ID查找历史修改记录信息
      doCreateProjectLogHistory: '/api/op/v1/projectLog/history', // 新增项目日志历史记录
      doCreateProjectRecordHistory: '/api/op/v1/projectLog/trace', // 新增项目日志跟踪记录
      doCreateProjectLogApproval: '/api/op/v1/projectLog/demandApply', // 新增项目日志审批信息
      doGetProjectApprovalById: '/api/op/v1/projectLog/demand', // 根据项目日志ID查找审批信息
      doProjectLogUploadRq: '/api/op/v1/projectLog/upload', // excle导入项目日志
      projProList: '/api/op/v1/select/multicol/project', // 属于自己的项目列表
    },
    distribute: {
      distributes: '/api/op/v1/dists', // 派发列表查询
      saveDist: '/api/op/v1/dist', // 保存派发相关信息
      submitDist: '/api/op/v1/dist/proc/start/:id', // 启动派发流程
      saveBroadcast: '/api/op/v1/dist/broadcast', // 保存并广播派发信息
      findDist: '/api/op/v1/dist/:id', // 派发单条信息查询
      distResponse: '/api/op/v1/dist/:distId/responds', // 获得派发详情的 响应列表
      myResponses: '/api/op/v1/dist/myResponds', // 派发 我响应的广播列表
      responses: '/api/op/v1/dist/recvedResponds', // 派发 我接收的响应列表
      cancelBroadcast: '/api/op/v1/dist/:distId/broadcast', // 取消广播
      rejectResponse: '/api/op/v1/dist/respond/:ids/reject', // 谢绝响应
      deleteIds: '/api/op/v1/dists/del/:ids', // 批量删除派发
      broadcast: '/api/op/v1/broadcast', // 广播任务看板
      invite: '/api/op/v1/respond/invite', // 我收到的邀请
      broadcastInterested: '/api/op/v1/dist/respond/interested/pc', // 广播看板 -- 感兴趣
      broadcastUninterested: '/api/op/v1/dist/respond/notApplicable/pc', // 广播看板 -- 不感兴趣

      inviteInterested: '/api/op/v1/respond/:id/interested', // 任务邀请响应 -- 感兴趣
      inviteNotApplicable: '/api/op/v1/respond/:id/notApplicable', // 任务邀请响应 -- 不适合
      checkDistribute: '/api/op/v1/dist/check', // 判断派发按钮是否可用
      updateDistStatus: '/api/op/v1/dist/myResponds/updateStatus/:id', // post    改变响应状态
    },
    equivalent: {
      ledgerSelectConditional: '/api/common/v1/conditional/select/ledgers', //  账户条件下拉
      feeCodeSelectConditional: '/api/common/v1/conditional/select/feeCode', //  费用码条件下拉
      accSelectConditional: '/api/common/v1/conditional/select/acc', //  科目条件下拉
      findType: '/api/base/v1/eqvaSettle/:id', // get 根据 id 来查询类型，跳转到对应的当量结算审批页面
      // 当量结算
      list: '/api/base/v1/eqvaSettles', // get 当量结算列表
      equivalentInfo: '/api/base/v1/eqvaSettle', // get 当量结算单据详情 结算单明细查询 post 保存
      checkLastEquivalentDate: '/api/base/v1/canSettlement/:settlementDate', // get 判断所选日期能否结算
      queryLastCountDate: '/api/base/v1/getLastSettlementDate', // get 获得结算日期冻结
      updateLastCountDate: '/api/base/v1/setLastSettlementDate/:lastSettlementDate', // post 设置结算日期冻结
      equivalentSC: '/api/base/v1/eqvaSettle/checkAndSave/:procTaskId', // post 单价、总价审批通过是保存、检查
      sumTable: '/api/base/v1/eqvaSettleDs/total', // get 按总价结算表格数据
      singleTable: '/api/base/v1/eqvaSettleDs/single', // get 按单价结算表格数据
      common: '/api/base/v1/eqvaSettle/universal', // put 泛用的保存
      commonSC: '/api/base/v1/eqvaSettle/uniCheckAndSave/:procTaskId', // put 泛用的审批通过时检查
      commonD: '/api/base/v1/eqvaSettles/:ids/d', // patch 泛用的删除
      settleType: '/api/base/v1/eqvaSettle/settleTypes', // get 结算类型
      procStart: '/api/base/v1/eqvaSettle/procStart/:id', // post 当量结算发起流程
      normSettleCreate: '/api/worth/v1/norm_settle', // post 创建泛用金额结算
      normSettleModify: '/api/worth/v1/norm_settle', // put 修改泛用金额结算
      normSettleListPaging: '/api/worth/v1/norm_settle', // get 泛用金额结算列表(分页)
      normSettleDetail: '/api/worth/v1/norm_settle/:id', // get 泛用金额结算详情
      normSettleLogicalDelete: '/api/worth/v1/norm_settle', // patch 泛用金额结算 逻辑删除
      normSettleTransfer: '/api/worth/v1/norm_settle/transfer/:id', // put 泛用金额结算 过账
      normSettleCancel: '/api/worth/v1/norm_settle/cancel/:id', // put 泛用金额结算 取消过账
      normSettleSubmit: '/api/worth/v1/norm_settle/submit', // put 提交泛用金额结算
      checkTaskEqvaStl: '/api/base/v1/eqvaSettle/checkTaskEqva/:id', // 当量结算审批通过后，校验任务包的当量是否已经全部结算
      closeTaskBySId: '/api/base/v1/eqvaSettle/closeTaskByStlId/:id', // 根据结算单id关闭任务包

      freezeList: '/api/worth/v1/freezeList', // get 查询可解冻的冻结列表
      unfreezeCreate: '/api/worth/v1/unfreeze', // post 创建解冻
      inchargeUnfreezeCreate: '/api/worth/v1/incharge/unfreeze', // post 创建解冻
      unfreezeModify: '/api/worth/v1/unfreeze', // put 修改解冻
      unfreezeDetail: '/api/worth/v1/unfreeze/:id', // get 解冻详情
      unfreezeListPaging: '/api/worth/v1/unfreeze', // get 解冻列表

      settleList: '/api/worth/v1/settleList', // get 查询可提现的结算单列表
      withdrawCreate: '/api/worth/v1/withdraw', // post 创建提现
      buWithdrawCreateUri: '/api/worth/v1/buWithdraw', // post 创建BU提现
      withdrawModify: '/api/worth/v1/withdraw', // put 修改提现
      withdrawDetail: '/api/worth/v1/withdraw/:id', // get 提现详情
      withdrawListPaging: '/api/worth/v1/withdraw', // get 提现列表
      withdrawIds: '/api/worth/v1/withdraw/ids/:ids', // get 查询指定id的提现记录
      getBuWithdrawSumUri: '/api/worth/v1/getBuWithdrawSum', // get 查询指定id的提现记录

      supplierSelectConditional: '/api/common/v1/select/conditional/supplier', //  供应商条件下拉

      withdrawPayCreate: '/api/worth/v1/withdraw_pay', // post 创建提现付款
      withdrawPayModify: '/api/worth/v1/withdraw_pay', // put 修改提现付款
      withdrawPayDetail: '/api/worth/v1/withdraw_pay/:id', // get 提现付款详情
      withdrawPayListPaging: '/api/worth/v1/withdraw_pay', // get 提现付款列表
      withdrawPayLogicalDelete: '/api/worth/v1/withdraw_pay', // patch 提现付款 逻辑删除
      withdrawPayAutoFlow: '/api/worth/v1/withdraw_pay/autoFlow/:id', // get 生成报销流程
      withdrawPayDeleteFlow: '/api/worth/v1/withdraw_pay/deleteFlow/:id', // get 删除报销流程

      buWithdrawPayCreateUri: '/api/worth/v1/bu_withdraw_pay', // post 创建提现付款
      buWithdrawPayModifyUri: '/api/worth/v1/bu_withdraw_pay', // put 修改提现付款
      buWithdrawPayDetailUri: '/api/worth/v1/bu_withdraw_pay/:id', // get 提现付款详情
      buWithdrawPayListPagingUri: '/api/worth/v1/bu_withdraw_pay', // get 提现付款列表
      buWithdrawPayLogicalDeleteUri: '/api/worth/v1/bu_withdraw_pay', // patch 提现付款 逻辑删除
    },
    expense: {
      // 报销
      changeLeadsStatus: '/api/op/v1/leads/reward/:id', // 变更线索领奖状态
      expenses: '/api/base/v1/reim/list', // g 查询报销列表
      myexpenses: '/api/base/v1/reim/my', // g 查询我的报销列表
      expense: '/api/base/v1/reim/{id}', // g 查询报销 - 单条
      businessTrip: '/api/base/v1/reim/businessTrip', // c 费用报销(差旅) -- 新增
      unBusinessTrip: '/api/base/v1/reim/unBusinessTrip', // c 费用报销(非差旅) -- 新增
      expenseSave: '/api/base/v1/reim', // c  费用报销 -- 保存
      expenseApproved: '/api/base/v1/reim/batchAppr/:ids/:type', // post  费用报销 -- 批量审批
      expenseRejected: '/api/base/v1/reim/batchReject/:ids/:type', // post  费用报销 -- 批量拒绝
      expenseGetProcConf: '/api/base/v1/reim/getProcConfig', // 拉取特定的流程配置
      spec: '/api/op/v1/feeapply/getFeeApply/:id', // g 查询特殊费用申请明细
      specSave: '/api/op/v1/feeapply/save', // s 特殊费用申请新增、编辑保存
      accountList: '/api/worth/v1/acc/pay/account/page', // 记账导出列表
      payList: '/api/worth/v1/acc/pay/cashier/page', // 付款导出列表
      invoiceVerify: '/api/base/v1/invoiceVerify/:resId', // post 判断住宿费是否超标 && 连号是否发票检查 -- 新增

      reimType2Select: '/api/base/v1/reim/select/unBusiTrip/reimType2/udc',
      reimType2SelectTrip: '/api/base/v1/reim/select/busiTrip/reimType2/udc',
      reimType2SelectSpecial: '/api/base/v1/reim/select/special/reimType2/udc',
      projectSelect: '/api/base/v1/reim/select/projects/{resId}',
      buTaskSelect: '/api/base/v1/reim/select/tasks/bu/{resId}',
      preSaleTaskSelect: '/api/base/v1/reim/select/tasks/preSales/{resId}',
      contractSelect: '/api/base/v1/reim/select/purchaseContract/{resId}',

      accountSelect: '/api/base/v1/reim/select/account',
      accountAllSelect: '/api/base/v1/reim/select/acc/account',
      payplanSelect: '/api/base/v1/reim/select/payPlan/{contractId}',

      reimTmplGet: '/api/base/v1/reim/select/reimTmpl',

      buSelect: '/api/base/v1/reim/select/expenseBu',
      taskExpenseBu: '/api/base/v1/reim/select/task/expenseBu',
      projectExpenseBu: '/api/base/v1/reim/select/project/expenseBu',
      contractExpenseBu: '/api/base/v1/reim/select/contract/expenseBu',

      tripApply: '/api/base/v1/reim/select/busiTrip/apply',
      feeCodeSelect: '/api/base/v1/reim/select/feeCode/{reasonType}',

      getMealFee: '/api/base/v1/reim/tripMealDay',

      adjustedAmtSave: '/api/base/v1/reim/{id}/adjustAmt',

      specInit: '/api/base/v1/reim/sepc/init/:resId', // 专项报销，根据报销人拉取对应初始化数据
      specCreate: '/api/base/v1/reim/createSpec', // post 新增专项费用
      specUpdate: '/api/base/v1/reim/updateSpec', // put 编辑专项费用

      particularPost: '/api/base/v1/reim/createExecp', // post 特殊费用报销创建 -- submitted 创建工作流
      particularPut: '/api/base/v1/reim/updateExecp', // put 特殊费用报销更新 -- 保存 -- submitted 创建工作流
      particularApply: '/api/op/v1/feeapply/listSel', // get 特殊费用申请下拉查询api
      particularThreshold: '/api/op/v1/reim/getSettingParam', // get 获取费用报销金额参数 最低报销限制
      particularApplyAvailable: '/api/base/v1/reim/getExecpAmt/:feeApplyId', // get 本次可以报销的金额 接受特殊费用申请单 id

      expensePeriodCheck: '/api/common/v1/getPeriodByDate/:date', // get 判断当前系统日期在财务期间表（T_FIN_PERIOD）是否能取到期间值
      projectBudgetCheck: '/api/op/v1/project/budget/check', // 项目报销，业务审批节点前先校验预算
      saveAccountJde: '/api/worth/v1/acc/jdeaccount/save/:accPayBatchIds', // 保存报销记账数据，用于jde数据同步，保存加修改
      savePayJde: '/api/worth/v1/acc/jdepay/save/:accPayBatchIds', // 保存报销付款数据，用于jde数据同步，保存加修改

      taxList: '/api/worth/v1/costrush/list', // 进项税列表
      reimNameList: '/api/common/v1/select/reimName', // 财务稽核专员
      updateCost: '/api/worth/v1/costrush/updateCost/:ids', // 进项税抵扣
      costrushUpload: '/api/worth/v1/costrush/upload', // 进项税自动抵扣
      expensesBatch: '/api/base/v1/leadreim/list', // g 查询报销单批量审批列表
      expensesBatchApproved: '/api/base/v1/leadreim/batchAppr/:ids', // p 财务负责人批量通过
      expensesBatchRejected: '/api/base/v1/leadreim/batchReject/:ids', // p 财务负责人批量退回

      startWithdrawPayFlow: '/api/base/v1/reim/withdrawPayStart/:id', // g 开始提现付款流程
      modifyWithdrawPayFlowUri: '/api/base/v1/reim/withdrawPayEdit', // p 修改提现付款流程
      updateProblemTypeDesc: '/api/base/v1/reim/updateProblemType', // 更新问题类型
      discountReim: '/api/base/v1/reim/discount/:reimIds/:discountNum', // 报销单打折 最后一位传递小数会导致后端接不到小数；后端可以通过:.+来接小数；或者前端把带小数的参数放到中间

      getExpenseDetail: '/api/base/v1/reim/reimFlow/:reimNo', // 根据报销单单号获取报销单详情

      selectRoleCodeByResId: '/api/base/v1/reim/selectRoleCodeByResId/:resId', // 获取报销资源角色
    },
    feeapply: {
      // 费用申请
      feeApplys: '/api/op/v1/feeapply/list', // g 查询费用申请列表
      feeApply: '/api/op/v1/feeapply/getFeeApply/:id', // g 查询特殊费用申请明细
      feeApplyDel: '/api/op/v1/feeapply/del/:ids', // s 特殊费用申请删除
      feeApplySave: '/api/op/v1/feeapply/save', // s 特殊费用申请新增、编辑保存
      custSelectBy: '/api/op/v1/feeapply/getCustomer', // g 根据项目id获取客户信息
      buSelectBy: '/api/op/v1/feeapply/buSelectBy', // g 根据项目id获取费用承担bu
      getAccTreeByBuo: '/api/op/v1/feeapply/getAccTreeByBuo/:buId', // g 根据费用承担bu.id获取费用科目树
      specTaskStart: '/api/op/v1/feeapply/proc/start/:id', // 特殊费用申请 提交流程
    },
    // 公共下拉（建议后面的都放这）
    coopSelect: '/api/common/v1/select/coop', // g 合作伙伴下拉
    capasetLevelSelectBy: '/api/common/v1/select/capasetLevelBy', //  复合能力级别下拉根据工种、工种子类
    capasetLevelSelect: '/api/common/v1/select/capasetLevel', //  复合能力级别下拉
    capaLevelSelect: '/api/common/v1/select/capaLevel', //  单项能力级别下拉
    userMultiColSelect: '/api/common/v1/select/multicol/user', // 人员多列下拉数据
    validUserMultiColSelect: '/api/common/v1/select/multicol/valid/user', // 平台已认证人员多列下拉数据
    userMcTaskSelect: '/api/common/v1/select/multicol/task/user', // 人员多列下拉数据 - 带BU
    userInJobSelect: '/api/common/v1/select/multicol/valid/user', // 获取在职人员数据 带 BU base地
    validUserSelect: '/api/common/v1/select/valid/user', // 平台已认证人员单列下拉
    buMultiColSelect: '/api/common/v1/select/multicol/bu', // bu多列下拉数据
    custMultiColSelect: '/api/common/v1/select/multicol/customer', // 客户多列下拉
    productMultiColSelect: '/api/common/v1/select/multicol/product', // 产品下拉
    suppMultiColSelect: '/api/common/v1/select/multicol/supplier', // 选择供应商
    activeBuSelect: '/api/common/v1/select/activeBu', // 激活状态的BU - 下拉
    projectBySelect: '/api/common/v1/select/:resId/project', // 相关项目 - 下拉
    ousSelect: '/api/common/v1/select/ous', // gj/ 公司下拉数据 - 显示ouName
    ousSelectByAbNo: '/api/common/v1/select/ous/:abNo', // 根据供应商的地址簿号查询开票主体
    productClass: '/api/common/v1/select/bu/productClass', // BU产品下拉(带产品大小类)-目前查所有
    custSelect: '/api/common/v1/select/customer', // g 客户下拉
    buProductSelect: '/api/common/v1/select/bu/product', // g 产品下拉
    projectSelect: '/api/common/v1/select/project', //  项目下拉
    allTaskSelect: '/api/common/v1/select/task', //  任务下拉
    abOuSelect: '/api/common/v1/select/ou/ab', // g 法人地址薄
    allAbOuSelect: '/api/common/v1/select/all/ab', // 新增供应商查询
    beginPeriodSelect: '/api/common/v1/select/beginPeriod', // g 业务开始年期
    internalOuSelect: '/api/common/v1/select/ou/internal', // g 内部公司 - 下拉
    taskByProjIdSelect: '/api/common/v1/select/task/:projId', // g 项目id查询相关任务 - 下拉
    iamUserSelect: '/api/common/v1/select/iamUser', // g 登录用户（不是资源） - 下拉
    iamAllUserSelect: '/api/common/v1/select/iamAllUser', // g 登录用户（不是资源） - 下拉
    equaTaskByProjectIdSelect: '/api/common/v1/select/task/:id', // get 当量结算泛用的任务下拉
    externalUser: '/api/common/v1/select/multicol/external/user', // 外部资源下拉
    // 费用报销模块下拉(私有)
    taskSelect: '/api/op/v1/select/task', // 任务包 - 下拉(可以通过有无resId缩小范围)
    projSelect: '/api/op/v1/select/busiproject', // 项目 - 下拉(可以通过有无resId缩小范围)
    buSelect: '/api/op/v1/select/expensebu', // BU - 下拉(带所属公司)
    projectMultiColSelect: '/api/common/v1/select/multicol/project', // 项目多列下拉
    financeCalendarSelect: '/api/common/v1/select/finance/calendar', // 财务日历格式下拉（单列）
    buAndMember: '/api/op/v1/attendance/res', // g 获取资源及资源下属
    buMemberList: '/api/person/v1/vacation/baseBu', // get 获取bu资源列表
    buPriceList: '/api/org/v1/bu/resBu', // BU当量定价管理中 两个页面的BU下拉框
    queryPageBlock: '/api/sys/v1/business_page/pageBlock/:key', // 查询区域 根据业务页面主键查询业务页面单元-用于表单资源字段的下拉
    queryPageField: '/api/sys/v1/business_page/pageField/:key', // 查询字段 根据业务页面单元主键查询业务页面表单字段-用于表单资源字段的下拉
    queryBuPageField: '/api/sys/v1/business_page/pageField/:businessType/:key', // 查询字段 根据业务页面单元主键查询业务页面表单字段-用于表单BU负责人字段的下拉

    selectTenantProc: '/api/common/v1/select/tenantProc', // g 租户流程 - 下拉

    resMgt: {
      resFindList: '/api/person/v1/resFind', // g 资源查找列表
    },
    myVacation: {
      vacationApply: '/api/person/v1/vacationApply', // 假期申请列表、新增、更新
      vacationResDetail: '/api/person/v1/vacationApply/resInfo/:resId', // 我的假期详情
      vacationFlowDetail: '/api/person/v1/vacationApply/:id', // 假期流程详情
    },
    weeklyReport: {
      // 工作计划
      workPlanList: '/api/person/v1/resWorkPlan/list', // 工作计划列表
      workPlanCreate: '/api/person/v1/resWorkPlan/insert', // 工作计划新增
      workPlanDetails: '/api/person/v1/resWorkPlan/:id', // 工作计划详情
      workPlanUpdate: '/api/person/v1/resWorkPlan/update', // 工作计划修改
      workPlanDelete: '/api/person/v1/resWorkPlan/delete/:ids', // 工作计划删除
      workPlanChangeStatus: '/api/person/v1/resWorkPlan/updateStatus/:ids/:planStatus', // 工作计划状态更改
      taskAll: '/api/common/v1/select/:resId/taskAll', // 任务包下拉
      activity: '/api/op/v1/tasks/timesheet/activity/:taskId', // 活动下拉

      // 周报填写
      workReportFindByDate: '/api/person/v1/resWeeklyReport/findByDate/:weekStartDate', // 周开始日期获取周报详情
      workReportCreate: '/api/person/v1/resWeeklyReport/save', // 保存周报信息
      getWorkPlan: '/api/person/v1/resWeeklyReport/getWorkPlan/:dateFrom', // 拉取工作计划(导入工作计划)
      getPResInfo: '/api/person/v1/res/getPResInfo', // 获取上级领导信息

      // 周报查看
      weeklyReportList: '/api/person/v1/resWeeklyReport/list', // 周报查看列表信息
      weeklyReportDetail: '/api/person/v1/resWeeklyReport/:id', // 周报详情查看

      // 我的周报
      myWeeklyReportList: '/api/person/v1/resWeeklyReport/my', // 我的周报列表信息

      // 工作日历
      workCalendar: '/api/person/v1/res/work/calendar', // get 工作日历
      updateWorkStatus: '/api/person/v1/res/work/Position/:workStatus/:resId', // p 工作状态

      // 工作日志
      workLogSaveUri: '/api/op/v1/workdiarys/save', // 工作日志保存
      queryStartTimeUri: '/api/op/v1/workdiarys', // 工作日志查询
      workPlanSelectUri: '/api/op/v1/select/workPlan', // 工作计划下拉
      workReportSaveUri: '/api/op/v1/workReport/save', // 工作日志汇报保存
      workLogsQueryUri: '/api/op/v1/select/workLogs', // 查询工作日志

      // 我的报告
      workReportsUri: '/api/op/v1/workReports', // 报告查询
      delWorkReportsUri: '/api/op/v1/workReports/del/:ids', // 报告批量删除
      workReportsDetailUri: '/api/op/v1/workReports/details', // 工作报告详情
      myWorkReportUri: '/api/op/v1/workReports/report/:id', // 我的报告汇报

      // 报告查看
      MyReportCheckListUri: '/api/op/v1/workReports/check', // 查询

      // 工作计划-正泰
      workPlanChntList: '/api/op/v1/resWorkPlan/selectAllByCondtition', // 工作计划-正泰列表
      workPlanChntCreate: '/api/op/v1/resWorkPlan/insert', // 工作计划-正泰新增
      workPlanChntDetails: '/api/op/v1/resWorkPlan/selectById/:id', // 工作计划-正泰详情
      workPlanChntDelete: '/api/op/v1/resWorkPlan/deleteOne/:ids', // 工作计划-正泰删除
      workPlanChntUpdate: '/api/op/v1/resWorkPlan/updateOneById', // 工作计划-正泰修改,
      workPlanChntFinish: '/api/op/v1/resWorkPlan/endWorkPlan/:ids', // 工作计划-正泰 结束按钮
      objectiveAll: '/api/common/v1/select/object', // 目标下拉
      workPlanChangePoint: '/api/op/v1/resWorkPlan/updateEmphasisAttention/:ids/:planStatus', // 工作计划-正泰更改
    },
    probation: {
      getResults: '/api/person/v1/checkresult/getResults', // p 工作状态
      checkresultSave: '/api/person/v1/checkresult/save', // 检查结果的保存
      evalGetPoint: '/api/base/v1/eval/getPoint', // 获取评价点信息
      saveEvals: '/api/base/v1/eval/saveEvals', // 保存评价信息
      saveMid: '/api/person/v1/resProbationPeriodCheck/saveMid', // 中期考核 保存:新增+修改；发起流程+推流程
      saveFinal: '/api/person/v1/resProbationPeriodCheck/saveFinal', // 末期考核 保存:新增+修改；发起流程+推流程
      deleteApi: '/api/person/v1/resProbationPeriodCheck/delete/:ids', // 删除
      detail: '/api/person/v1/resProbationPeriodCheck/:id', // 详情
      list: '/api/person/v1/resProbationPeriodCheck/list', // 分页查询
      checkresult: '/api/person/v1/checkresult/list/:id', // 拉取项目结项流程检查事项及结果
      getCapacityList: '/api/person/v1/mycapaSet', // 拉取复合能力列表
    },
    // 会议室管理
    meeting: {
      meetingRoomCreate: '/api/common/v1/meetingRoom/save', // post 创建会议室
      meetingRoomUpdate: '/api/common/v1/meetingRoom/update', // patch 更新会议室
      meetingRoomDelete: '/api/common/v1/meetingRoom/remove/:ids', // patch 删除会议室(批量)
      getMeetingRoomPlaceList: '/api/common/v1/meetingRoom/getMeetingRoomPlaceList', // get 获取获取会议室地址列表
      getMeetingRoomNameList: '/api/common/v1/meetingRoom/getMeetingRoomNameList', // get 获取会议室名称列表（返回'会议室名称-会议室地点'集合）
      getMeetingRoomList: '/api/common/v1/meetingRoom/getList', // get 根据条件查询会议室列表
      getMeetingRoomDetail: '/api/common/v1/meetingRoom/get/:id', // get 根据id查询会议室详情
      reservedRoomList: '/api/common/v1/meetingRoomReserved/getList', // get 根据条件查询会议室预约列表
      reservedRoomDetail: '/api/common/v1/meetingRoomReserved/get/:id', // get 根据id查询会议室预约详情
      reservedRoomListByWeek:
        '/api/common/v1/meetingRoomReserved/getListByWeek/:startDate/:endDate', // get 按周查询会议室预约列表
      removeReservedRoom: '/api/common/v1/meetingRoomReserved/remove/:ids', // patch 删除会议室预约（批量）
      reservedRoomCreate: '/api/common/v1/meetingRoomReserved/save', // post 会议室预约新增
      reservedRoomUpdate: '/api/common/v1/meetingRoomReserved/update', // patch 更新会议室预约
    },
    // 电子发票管理
    invoice: {
      getInvoiceList: '/api/person/v1/invoice/query', // get 根据条件查询发票列表
      inValidInvoices: '/api/person/v1/invoice/inValid/:ids', // patch 作废发票(批量)
      changeOwner: '/api/person/v1/invoice/changeOwner/:ids/:ownerId', // patch 修改归属人（批量)
      invoiceDtl: '/api/person/v1/invoice/get/:id', // get 根据ID查询发票详情
      getInvoicesFromBaiwang: '/api/person/v1/invoice/getInvoicesFromBaiwang', // get (从百望系统)同步个人的发票信息至发票池
      delInvoiceUrl: '/api/person/v1/invoice/delInvoice/:ids', // patch 物理删除发票
    },

    // 推行提醒
    remind: {
      selectTrainingAll: '/api/base/v1/resTrainingProg/selectTrainingAll', // 拉取 三个弹窗所有详细信息
      updateNewPushFlag: '/api/base/v1/resTrainingProg/updateNewPushFlag/:flag/:trainingProgIds', // 更新推送提醒是否弹出
      updateShowFlag: '/api/base/v1/resTrainingProg/updateShowFlag/:flag', // 更新第一个弹窗是否弹出
    },
  },
  task: {},
  org: {
    bumain: '/api/org/v1/bu', // bu主数据查询
    bubasic: '/api/org/v1/bu/:buId', // bu基础信息
    buDelete: '/api/org/v1/bu/x', // bu逻辑删除
    buActive: '/api/org/v1/bu/act/:ids', // BU激活
    bucats: '/api/org/v1/bu/cats/:buId', // bu类别码
    bubasicupdate: '/api/org/v1/bu/:buId/basic', // bu基础信息更新
    bucatsupdate: '/api/org/v1/bu/:buId/bucat', // bu类别码更新
    bupartner: '/api/org/v1/bu/partner/:buId', // bu合伙人查询
    bupartnersave: '/api/org/v1/bu/:buId/partner', // bu合伙人保存
    bueqva: '/api/org/v1/bu/eqva/:buId', // bu资源当量收入查询
    bueqvaUri: '/api/org/v1/bu/eqva', // 资源当量收入查询
    bueqvasave: '/api/org/v1/bu/:buId/eqva', // bu资源当量收入保存
    bueqvasaveBy: '/api/org/v1/bu/buEqva/:buId', // bu资源当量收入保存 单条
    bueqvaDel: '/api/org/v1/bu/buEqva/:ids', // bu资源当量收入 删除
    buTree: '/api/common/v1/bu/tree', // gj/ bu树
    busSelect: '/api/common/v1/select/bu', // gj/ bu下拉数据
    resBusSelect: '/api/common/v1/select/resBu', // gj/ bu下拉数据
    buMainTree: '/api/org/v1/bu/tree', // bu主数据树
    buMainMyTree: '/api/org/v1/myBu/tree', // bu主数据树
    buAcc: '/api/org/v1/bu/acc/:buId', // bu财务科目
    buFound: '/api/org/v1/bu', // g/ bu创建
    buFoundLinmon: '/api/org/v1/linmon/bu', // g/ bu创建
    buResSelect: '/api/common/v1/select/bu/res/:buId', // 非本bu资源下拉
    buResPlusSelect: '/api/common/v1/select/bu/res/plus/:buId', // 本bu资源下拉
    buResRoleSelect: '/api/common/v1/select/bu/res/role', // bu资源角色下拉
    buPUserSelect: '/api/common/v1/select/bu/res/puser', // bu主管下拉
    buResInfo: '/api/org/v1/bu/res/:buId', // p/ bu资源信息新建 g/ bu资源信息列表
    buResQuery: '/api/org/v1/bu/res', // g/ bu资源信息列表 --bu详情页
    buResInfoSave: '/api/org/v1/bu/res', // bu资源信息保存
    resActive: '/api/org/v1/buRes/active', // p 资源批量激活
    buResRoleInfo: '/api/org/v1/bu/res/role/:buresId', // bu资源角色
    buSaveResRole: '/api/org/v1/bu/res/role/:buId/:buResId', // bu保存资源角色
    buProdClass: '/api/org/v1/bu/prodclass/:buId', // bu经营范围列表
    buClassTree: '/api/common/v1/class/tree', // gj/ 产品分类树
    buProdClassSave: '/api/org/v1/bu/:buId/prodclass', // 产品分类保存(经营范围)
    buLedger: '/api/org/v1/ledger/bu', // bu账户
    buLedgerIo: '/api/org/v1/ledger/io/bu', // bu账户 - 台账
    resLedger: '/api/org/v1/ledger/res', // 个人账户
    resLedgerIo: '/api/org/v1/ledger/io/res', // 个人账户 - 台账
    ledgerIoByBu: '/api/org/v1/ledger/buLedgerIo', // BU当量交易记录
    ledgerIoByRes: '/api/org/v1/ledger/resLedgerIo', // 个人当量交易记录
    buProduct: '/api/org/v1/bu/prodManager', // bu产品管理
    offerApply: '/api/person/v1/offerEntry/apply',
    hangupAndClose: '/api/org/v1/bu/modifyBuStatus/:ids/:status', // patch 关闭和暂挂
    buVersion: '/api/org/v1/bu/backUp', // 获取和保存历史版本
    findTreeByVersion: '/api/org/v1/bu/tree/:id', // 根据版本号获取bu数据树形菜单
    findBuReimbursementList: '/api/org/v1/reim/bu/list', // BU报销单管理列表
    checkReimbursement: '/api/org/v1/check/bu/reim/:id', // 根据费用报销单id校验
    getCostSharing: '/api/org/v1/cost_sharing/:id', // 查询分摊明细
    costSharing: '/api/org/v1/cost_sharing', // post:插入分摊明细 get:分摊列表查询
    examCostSharingTask: '/api/org/v1/cost_sharing/activation/pass', // examCostSharingTask
    getBuList: '/api/op/v1/bu/ouSelect', // get 获取当前登录人负责的 bu 列表
    getBuInfo: '/api/op/v1/bu/name', // get 获取选中 BU 的 Bu 详情
    getOkrInfo: '/api/op/v1/bu/okr', // get 根据 BU ID 获取 okr 相关信息
    getRankInfo: '/api/op/v1/bu/dateTop', // get 获取排行榜信息
    getOkrList: '/api/op/v1/bu/okrList', // get 获取 okr 列表
    getWorkPlanList: '/api/op/v1/bu/workPlanList', // get 获取工作计划列表
    getReportList: '/api/op/v1/bu/workReportList', // get 获取工作报告列表
    getExamList: '/api/op/v1/bu/examList', // get 获取绩效考核列表
    getBuMember: '/api/op/v1/bu/resList', // get 根据 buid 获取资源下拉
    getMenu: '/api/op/v1/bu/benchMenuBu', // get
    getOrgResInfo: '/api/org/v1/eqvaRatio/getResInfo/:buId/:resId', // get方法 资源id获取本资源信息和当前额定当量系数
    getResRatioList: '/api/org/v1/eqvaRatio/getRatioList/:buId/:resId', // get方法 根据buId 资源id获取本资源的当量系数调整记录
    saveResRatio: '/api/org/v1/eqvaRatio/saveRatio', // post方法 保存当量系数数据
    getResEqvaList: '/api/org/v1/eqvaRatio/getEqvaList/:buId/:resId', // get方法 根据buId 资源id获取本资源的额定当量
    saveResEqva: '/api/org/v1/eqvaRatio/saveEqva', // post方法 保存额定当量数据
  },
  sale: {
    showHomePage: {
      selectVideoSynList: '/api/base/v1/video/selectVideoSynList', // get  展示厅首页 - 综合查询
      homePageTab: '/api/base/v1/video/selectSearchTab', // get  展示厅首页 - Tab栏
      tabSelectLabel: '/api/base/v1/video/selectVideoUdc', // get  展示厅首页 - 切换Tab页查询标签项
      videoSearchList: '/api/base/v1/video/selectVideoPage/:code', // get  展示厅首页 - 视频数据
      menuListLeft: '/api/base/v1/video/selectCategoryDValList/:id', // get  展示厅首页 - tab下的左侧边栏
      selectVideoCon: '/api/base/v1/video/selectVideoCon', // get  展示厅首页 - 点击菜单查询数据
    },
    purchaseContract: {
      paymentApplyList: '/api/worth/v1/paymentApply/list', // 付款申请单列表
      prePaymentApplySave: '/api/worth/v1/paymentApply/save', // 付款申请单保存
      prePaymentApplyUpdate: '/api/worth/v1/paymentApply/update', // 付款申请单更新
      paymentApplyDetail: '/api/worth/v1/paymentApply/get/:id', // 付款申请单详情
      removePaymentApply: '/api/worth/v1/paymentApply/remove/:id', // 付款申请单删除
      paymentApplyFlowSubmit: '/api/worth/v1/paymentApply/flowSubmit/:id', // 付款申请单流程提交
      paymentAppFirstFlowSubmit: '/api/worth/v1/paymentApply/flowReSubmit/:id', // 流程退回第一节点，提交
      paymentApplyAccountsNo: '/api/worth/v1/paymentApply/select/accounts/:abNo', // 获取银行账号
      paymentApplyAccounts: '/api/worth/v1/paymentApply/select/bank/:accountNo', // 获取银行账户名称
      paymentApplyInvoices: '/api/worth/v1/paymentApply/select/invoices/:type/:invoiceNo', // 获取发票号
      paymentApplyInvoicesDetail: '/api/worth/v1/paymentApply/invoices/:invoiceNo', // 获取发票详情
      paymentApplyOpportunity: '/api/worth/v1/paymentApply/select/opportunity', // 商机
      paymentApplyTempds: '/api/worth/v1/paymentApply/select/tempds/:code', // 科目
      purchaseSave: '/api/op/v1/purchase_contract_management/save', // 保存
      purchaseSubmit: '/api/op/v1/purchase_contract_management/submit', // 提交
      paymentSlipSave: '/api/worth/v1/paymentSlip/save', // 付款记录保存
      paymentSlipUpdate: '/api/worth/v1/paymentSlip/update', // 付款记录更新
      paymentSlipFlowSubmit: '/api/worth/v1/paymentSlip/flowSubmit/:id', // 付款单记录流程提交
      paymentSlipFlowReSubmit: '/api/worth/v1/paymentSlip/flowReSubmit/:id', // 退回到底一个节点提交
      paymentSlipDelete: '/api/worth/v1/paymentSlip/delete/:id', // 删除付款记录
      paymentSlipView: '/api/worth/v1/paymentSlip/view', // 付款记录列表
      paymentApplyByDocNoScene: '/api/worth/v1/paymentApply/:docNo/:scene', // 根据前置单据的单据号获取单据信息
      purchaseByDoc: '/api/op/v1/purchase_contract_management/paymentApply/{no}', // 预付款：根据前置单据的单据号获取采购合同单据信息
      paymentSlipDetailById: '/api/worth/v1/paymentSlip/:id', // 付款记录详情
      paymentApplyWriteoffSelect:
        '/api/worth/v1/paymentApply/select/writeoff/:docType/:supplierLegalNo', // 预付款核销单据号下拉框
      paymentWriteoffNoAndType: '/api/worth/v1/paymentApply/writeoff/:docNo/:docType', // 预付款核销单据号获取详情
      paymentSlipListById: '/api/worth/v1/paymentSlip/list/:paymentApplyId', // 根据付款申请单ID获取付款单记录列表
      paymentApplyCalc: '/api/worth/v1/paymentApply/calc/:agreementNo/:amt', // 协议单号获取费率
      paymentSlipFlowBatchSubmit: '/api/worth/v1/paymentSlip/flowBatchSubmit', // 批量提交付款记录
      paymentSlipBatchOperation: '/api/worth/v1/paymentSlip/batchOperation', // 批量操作付款单记录
      purchaseDetail: '/api/op/v1/purchase_contract_management/detail/:key', // 根据主键查询采购合同的详情 采购合同ID
      purchaseList: '/api/op/v1/purchase_contract_management', // 采购合同列表查询
      purchaseEdit: '/api/op/v1/purchase_contract_management/modify/:key', // 根据主键查询采购合同信息的修改回显接口
      purchasePending: '/api/op/v1/purchase_contract_management/:id/pending', // 采购合同的暂挂 采购合同ID
      purchaseActive: '/api/op/v1/purchase_contract_management/:id/active', // 采购合同的激活 采购合同ID
      purchaseChangeSubmit: '/api/op/v1/purchase_contract_management/change/submit', // 采购合同变更的提交
      purchaseChangeBypurchaseId: '/api/op/v1/purchase_contract_management/businessChange/:id', // 采购合同变更 查询采购合同变更 采购合同id
      purchaseChangeBypurChangeId:
        '/api/op/v1/purchase_contract_management/businessChange/purchase/:id', // 根据抽象变更ID查询采购合同变更 抽象变更id
      purchaseChangeDetailByChangeId:
        '/api/op/v1/purchase_contract_management/businessChange/detail/:id', // 根据抽象变更ID查询采购合同变更详情(包括销售合同信息、项目信息) 抽象变更id
      purchaseOverSubmit: '/api/op/v1/purchase_contract_management/over/submit', // 采购合同终止的提交
      purchaseOverByOverId: '/api/op/v1/purchase_contract_management/over/purchase/:id', // 根据采购合同终止ID查询采购合同信息
      purchaseOverDetailByOverId: '/api/op/v1/purchase_contract_management/over/detail/:id', // 根据采购合同终止ID查询采购合同详情(包括销售合同信息、项目信息)
      purchaseContractMilestone: '/api/op/v1/purchase_contract_management/milestone', // 根据验收方式和项目ID查询约束里程碑 项目ID projId;验收方式 acceptanceType;
      purchaseContractNode: '/api/op/v1/purchase_contract_management/contractNode', // 根据验收方式和销售合同ID查询约束合同节点 销售合同ID contractId;验收方式 acceptanceType;
      remove: '/api/op/v1/purchase_contract_management/:ids', // 删除
      selectOuByOuId: '/api/common/v1/select/ou/:id', // 根据ouId获取完整的公司信息
      selectPackage: '/api/common/v1/select/task/package/type', // 采购任务包类型的任务下拉
      selectProjectByTaskId: '/api/common/v1/select/task/project/:id', // 根据任务id查询相关项目

      // 付款记录的审批和状态流转
      paymentSlipList: '/api/worth/v1/paymentSlip/view', // 列表查询
      batchOperationOperate: '/api/worth/v1/paymentSlip/batchOperation', // 批量操作付款单记录

      // 薪资福利类
      accountsList: '/api/worth/v1/salaryPayConfig/view', // get 查询 薪资福利支付账户信息 分页列表
      updateAccount: '/api/worth/v1/salaryPayConfig/update', // put 更新账户信息
      saveAccount: '/api/worth/v1/salaryPayConfig/save', // post 保存账户信息
      deleteAccount: '/api/worth/v1/salaryPayConfig/remove/:ids', // patch 删除账户信息
      accountInfo: '/api/worth/v1/salaryPayConfig/details/:id', // get 获取账户信息
      generateByCost: '/api/worth/v1/paymentApply/generateByCost/:id', // get 通过薪资成本生成付款申请单

      // 采购需求
      purchaseDemandList: '/api/op/v1/contract/procurDemand/Detail', // get 查询 采购需求 分页列表
      // 渠道费用列表查询
      channelCostList: '/api/op/v1/contract/channelCost/page', // get 获取渠道费用列表

      // 获取id
      paymentApplyIdByDoc: '/api/worth/v1/paymentApply/getId/{no}', // 根据付款申请单编号获取ID
      purchaseAgreementIdByDoc: '/api/op/v1/purchase_agreement/getId/{no}', // 根据采购协议编号查询协议ID
      purchaseContractIdByDoc: '/api/op/v1/purchase_contract_management/getId/{no}', // 根据采购合同编号查询采购合同ID
    },
    purchaseAgreement: {
      queryList: '/api/op/v1/purchase_agreement', // 采购协议分页查询
      queryEdit: '/api/op/v1/purchase_agreement/:id', // 查询编辑信息
      save: '/api/op/v1/purchase_agreement', // 采购协议保存
      queryDetail: '/api/op/v1/purchase_agreement/details/:id', // 查询详情
      active: '/api/op/v1/purchase_agreement/:id/active', // 激活
      pending: '/api/op/v1/purchase_agreement/:id/pending', // 暂挂
      over: '/api/op/v1/purchase_agreement/over/submit', // 终止
      remove: '/api/op/v1/purchase_agreement/:ids', // 删除
      selectAssociation: '/api/op/v1/purchase_agreement/association', // 关联协议下拉
    },
  },
  plat: {
    // 问题反馈
    feedback: {
      saveFeedbackInfo: '/api/sys/v1/feed/in', // post 提交反馈信息
      feedbackList: '/api/sys/v1/feed/all', // feedback 列表
      feedbackDelete: '/api/sys/v1/feed/remove/:ids', // post 删除反馈问题
      feedbackUpdate: '/api/sys/v1/feed/update', // post 更新反馈问题
      feedbackInfo: '/api/sys/v1/feed/one/:id', // get 获取反馈问题详情
      feedbackClose: '/api/sys/v1/feed/close', // patch 关闭问题
      getMyList: '/api/sys/v1/feed/myList', // get 获取我的反馈列表
      closeMyFeedback: '/api/sys/v1/feed/close', // patch 关闭我的反馈
      getMyFeedState: '/api/sys/v1/feed/myFeedBack', // get 获取反馈红点状态
      updateMyFeed: '/api/sys/v1/feed/myFeedBack', // patch 点进我的反馈后更新红点状态
      saveRemark: '/api/sys/v1/feedback/remark/insert', // post 保存备注
      saveResult: '/api/sys/v1/feedback/result/insert', // post 保存处理结果
      getRemarkAndResult: '/api/sys/v1/feedback/remarkAndResult/:id', // get 获取备注和处理结果
    },
    // 消息中心
    message: {
      messageList: '/api/sys/v1/message/adm', // get  获取管理员信息中心列表
      saveMessage: '/api/sys/v1/message/in', // post 保存信息
      updateMessage: '/api/sys/v1/message/update', // post 更新消息
      getMessage: '/api/sys/v1/message/out/:id', // get 获取消息详情
      seedMessage: '/api/sys/v1/sendMessage/:id', // post 直接发送信息
      delMessage: '/api/sys/v1/message/delete/:ids', // delete 删除信息
      recallMessage: '/api/sys/v1/message/recall/:ids', // recall 撤回信息
      myMessageList: '/api/sys/v1/message/all', // get 获取我的消息列表
      idxMessageList: '/api/common/v1/messageCenter/message', // get 获取首页消息列表
      idxMessageCount: '/api/common/v1/messageCenter/count', // get 获取首页未读消息数量
      messageRead: '/api/sys/v1/message/info/:id', // get 更新消息状态
      timingMessageList: '/api/sys/v1/message/timing', // get 获取定时消息列表
    },
    // 薪资成本管理
    wageCost: {
      queryWageCostList: '/api/worth/v1/salCost/list', // 获取薪资成本列表
      delWageCostItem: '/api/worth/v1/salCost/del/:masterId', // 删除薪资成本列表
      getViewItem: '/api/worth/v1/salCost/tabView/:id', // 获取详情
      exportExecl: '/api/worth/v1/salCost/upload', // 导入execl
      saveDetailWageCost: '/api/worth/v1/salCost/save', // 保存
      updateDetailWageCost: '/api/worth/v1/salCost/update', // 更新
      submitWageCost: '/api/worth/v1/salCost/submitCheck/:id', // 提交
      createPayObj: '/api/worth/v1/salCostPayment/create', // 根据（薪资成本-明细数据）生成付款对象
      createBU: '/api/worth/v1/salcostBu/create', // 根据（薪资成本-明细数据）生成BU成本对象
      savePayObj: '/api/worth/v1/salCostPayment/save', // 付款对象新增
      updatePayObj: '/api/worth/v1/salCostPayment/update', // 付款对象更新
      saveBU: '/api/worth/v1/salcostBu/save', // BU新增
      updateBU: '/api/worth/v1/salcostBu/update', // BU更新
      paymentSelect: '/api/worth/v1/paymentSelect/:abNo', // 付款依据选择API
      flowPush: '/api/worth/v1/salCost/flowPush', // 驳回后重新提交
    },
    // 薪资成本明细
    wageCostDetail: {
      detaulQuery: '/api/worth/v1/salCost/dtl', // 明细数据查询
      payObjQuery: '/api/worth/v1/salCost/payment', // 付款对象查询
      buQuery: '/api/worth/v1/salCost/bu', // BU成本
    },
    // res
    ress: '/api/person/v1/res', // gj/p/  资源列表/新增
    res: '/api/person/v1/res/:id', // gj/u 资源详情
    resList: '/api/person/v1/resList/:id', // gj/u 资源详情列表
    resEqva: '/api/person/v1/res/eqva', // 当量系数调整记录
    resDel: '/api/person/v1/res/del/:ids', // s 资源批量删除
    resBlack: '/api/person/v1/res/addBlackList/:ids', // s 资源批量添加黑名单
    resWhite: '/api/person/v1/res/addWhiteList/:ids', // s 资源批量添加白名单
    resBasicByStatusUpdate: '/api/person/v1/res/basic/:id', // u 资源 新建-未审批状态:基础信息修改
    resPlatByStatusUpdate: '/api/person/v1/res/plat/:id', // u 资源 新建-未审批状态:平台信息修改
    resMessageUpdate: '/api/person/v1/res/Temporary', // 个人信息修改申请提交
    resTemporaryDetails: '/api/person/v1/resTemporary/:id', // 个人信息修改流程详情
    centerResUpdate: '/api/person/v1/res/center/:id', // u 资源 个人中心-基本信息修改
    resSubmit: '/api/person/v1/res/sync/bu/:resId', // u 资源提交审批
    entryExitList: '/api/person/v1/offerAndLeave/res/:resId', // 资源详情页面的入离职页签列表数据
    resAbility: '/api/person/v1/offerEntry/resAbility/:resId', // 资源单项能力和复核能力
    offerEntryMyCapaset: '/api/person/v1/offerEntry/myCapaset', // 拉取复合能力

    // 自评
    saveSelfEvaluation: '/api/person/v1/res/saveSelfEvaluation', // patch 保存自我评价
    getSelfEvaluation: '/api/person/v1/res/getSelfEvaluation/:id', // get 自我评价查询

    resEdubgs: '/api/person/v1/res/edubgs', // gj/p/ 资源教育经历列表/新增
    resEdubg: '/api/person/v1/res/edubgs/:id', // gj/u 资源教育经历详情/修改
    resEdubgDel: '/api/person/v1/res/edubg/del/:ids', // s 资源教育经历批量删除

    resWorkbgs: '/api/person/v1/res/workbgs', // gj/p/ 资源工作经历列表/新增
    resWorkbg: '/api/person/v1/res/workbgs/:id', // gj/u 资源教育经历详情/修改
    resWorkbgDel: '/api/person/v1/res/workbg/del/:ids', // s 资源工作经历批量删除

    resCerts: '/api/person/v1/res/certs', // gj/p/ 资源资质证书列表/新增
    resCert: '/api/person/v1/res/certs/:id', // gj/u 资源资质证书详情/修改
    resCertDel: '/api/person/v1/res/cert/del/:ids', // s 资源资质证书批量删除

    resCapas: '/api/person/v1/res/capas', // gj/ 资源能力-能力列表 /资源能力新增
    resCapasets: '/api/person/v1/res/capasets', // gj/ 资源能力-复合能力列表
    resCapaDel: '/api/person/v1/res/capa/del', // s 资源能力批量删除

    resGetrps: '/api/person/v1/res/getrps', // gj/ 资源奖惩列表/新增
    resGetrp: '/api/person/v1/res/getrps/:id', // gj/u 资源奖惩详情/修改
    resGetrpDel: '/api/person/v1/res/getrps/del/:ids', // s 资源奖惩批量删除

    buResDetail: '/api/person/v1/bu/res/:resId', // gj/ BU资源
    buResRole: '/api/person/v1/bu/res/role/:resId', // gj/ BU资源角色
    buResExamList: '/api/person/v1/bu/res/exam/:resId', // gj/ BU资源考核
    resProjlogs: '/api/person/v1/res/projlogs/:resId', // gj/ 资源项目履历列表
    // ou
    ousSelect: '/api/common/v1/select/ou', // gj/ 公司下拉数据 - 显示abName
    resProExp: '/api/person/v1/resProj/list', // g 资源项目履历列表
    resProExpSave: '/api/person/v1/resProj/save', // put 资源项目履历新增编辑
    resProExpDel: '/api/person/v1/resProj/del/:ids', // put 资源项目履历新增编辑
    resEnrollInfo: '/api/person/v1/resEntry/:resId', // g 资源入职信息
    resEnrollSubmit: '/api/person/v1/resEntry/add', // p 资源入职提交
    resEnrollFlow: '/api/person/v1/resEntry/appliedt/:id', // p 资源入职发起流程
    resEnrollCreateInfo: '/api/person/v1/resEntry/create/:resId', // g 资源创建信息
    resEnrollCreate: '/api/person/v1/resEntry/create/add', // p 资源创建
    resEnrollDelete: '/api/person/v1/resEntry/delete/:resId', // p 资源入职关闭删除
    resEnrollGetCreateInfo: '/api/person/v1/resEntry/getCreateInfo/:resId', // g 资源创建IT管理员详情
    resSyncELP: '/api/person/v1/resEntry/sync/res/:resId', // post 同步资源到RLP
    // personnel
    resHrLabel: '/api/person/v1/resHrLabel/:id', // g 查询人事信息标签
    HrLabel: '/api/person/v1/res/HrLabel', // p 保存人事信息卡片
    // 对外简历
    fileToOut: '/api/person/v1/res/fileToOut', // 对外简历列表查询
    fileToOutDate: '/api/person/v1/res/fileToOutDate/:id', // 对外简历列表更新时间
    // 个人信息自我描述保存
    updateSelf: '/api/person/v1/res/updateSelf', // 个人信息自我描述保存
    addr: {
      addr: '/api/person/v1/ab/:no/no', // g 地址详情
      addrSel: '', // g 母公司下拉
      addrSupInfo: '/api/person/v1/ab/supp/:no/no', // 供应商查询详细信息
      addrs: '/api/person/v1/ab/s', // g 地址列表查询
      addrSaveBasic: '/api/person/v1/ab', // p 地址新增 - 主数据
      addrSaveSup: '/api/person/v1/ab/supp', // p 地址新增 - 供应商
      addrSavePerson: '/api/person/v1/person', // p 地址新增 - 个人
      addrSaveCompany: '/api/person/v1/ou', // p 地址新增 - 公司
      addrSaveContact: '/api/person/v1/contact', // p 地址新增 - 联系人
      addrSaveBank: '/api/person/v1/ab/accs', // p 地址新增 - 银行
      addrSaveInvoice: '/api/person/v1/invinfo', // p 地址新增 - 开票
      addrSaveBook: '/api/person/v1/address', // p 地址新增 - 地址簿
      addrSaveCode: '/api/person/v1/ab/cats', // p 地址新增 - 类别码
      addrSaveCust: '/api/person/v1/cust/ab/updateCust', // p 地址新增 - 类别码
      addrSaveCoop: '/api/person/v1/coop', // p 地址新增 - 合作伙伴
      addrDel: '/api/person/v1/ab/:id/d', // s 地址删除
      addrSup: '/api/person/v1/ab/supp/s', // 查询供应商
      insertCustSupplierToU8c: '/api/production/ab/insertCustSupplierToU8c/:abNos', //同步到用友

      tickets: '/api/op/v1/tripTickets/:applyId/:resId', // g 行政订票
      ticketsSave: '/api/op/v1/tripTickets', // p 地址删除
      abList: '/api/common/v1/typical/coop', // 拉取ab公司列表
      addrSaveAll: '/api/person/v1/newCust/updateNewCustWithFlow', // 提交时保存全部
    },

    // recv
    recv: {
      recvplanList: '/api/op/v1/contract/recvplan', // g 合同收款计划查询 -- 列表 / PATCH 合同收款计划 -- 保存
      recvplanDetail: '/api/worth/v1/profit/getContractRecvInfo/:recvPlanId', // g 收款计划详情
      invInfoSelect: '/api/common/v1/select/invinfo/:custId', // g 开票信息下拉接口
      invInfoDetial: '/api/worth/v1/abInvinfo/:id', // g 开票信息 -- 查询详情
      invBatch: '/api/worth/v1/invBatchs', // post 合同开票 -- 保存 / patch 合同开票 -- 完成开票 / get 合同开票 -- 列表查询
      invPrint: '/api/worth/v1/invBatch/print/:id', // g 打印合同信息
      invBatchDetail: '/api/worth/v1/invBatch/:id', // 合同开票 -- 详情
      invBatchInfoSave: '/api/worth/v1/invBatchs/:invBatchId/invDtl', // post 发票信息 -- 保存
      invBatchContract: '/api/worth/v1/invBatchs/:id/recvplan', // get 合同收款计划查询 -- 列表(开票批次ID)
      invBatchInfo: '/api/worth/v1/invBatchs/:id/dtl', // get 收款明细查询 -- 列表
      invInput: '/api/worth/v1/contractRecvs', // post 发票收款录入 -- 保存
      invSubmit: '/api/worth/v1/invBatchs/applied', // p 开票申请 -- 保存
      getCustId: '/api/worth/v1/invBatchs/getCustIdByInvId/:invId',
      taskInvBatch: '/api/worth/v1/invBatchs/appliedt/:id',
      recvplans: '/api/worth/v1/invBatchs/recvplan/:ids', // g 合同收款计划查询 -- 列表 根据收款列表id数组查询
      // taskInvSubmit: '/eds/api/bpm/task/:taskId',
      invBatchDetailList: '/api/worth/v1/invBatchs/:ids', // g 合同开票 -- ids列表
      recvplanslList: '/api/worth/v1/invBatchs/batch/:ids/recvplan', // g 收款明细列表 -- ids列表
      rollbackInvBatch: '/api/worth/v1/invBatchs/reject/:ids', // patch 退回
      getContractInfo: '/api/worth/v1/invBatchs/getContractInfo', // get 根据收款计划id或者开票计划id获取对应信息
      updateRecvInfo: '/api/worth/v1/invBatchs/updateRecvAccount/:invId/:accountNo/:ledgerDate', // get 更新收款表银行账号、总账日期
      getAccountNoByInvId: '/api/worth/v1/invBatchs/getAccountByInvId/:invId', // get 查询开票记录对应的合同的签约公司的银行账户
      getInvoiceItemList: '/api/person/v1/invoice/getInvoiceItemList', // get 商品信息下拉

      invBatches: '/api/worth/v1/invBatchs/pageQuery', // get 个人中心-合同管理-合同报销
      refundReason: '/api/worth/v1/invBatchs/returnTicket/:invBatchId/:disDisc', // put
      defaultRule: '/api/worth/v1/profit/batchProfit/:ids/:triggerType', // put 按默认规则自动分配
      selectCustExpApplyNo: '/api/op/v1/contract/applyNo', // g 客户请款单号下拉
      ouInternal: '/api/common/v1/select/ou/internal', // g 签约公司下拉
      recvPlanMultiColSelect: '/api/common/v1/select/multicol/recvplan', // 收款计划多列下拉数据
      innerAccountSelect: '/api/common/v1/select/multicol/innerAccount', // 公司内部银行账号多列下拉
    },
    // auacc
    auacc: {
      auAccs: '/api/worth/v1/au/accs', // gj/p/  科目余额列表/编辑
    },

    computer: {
      applyList: '/api/op/v1/device/list', // 自购电脑申请列表
      applyMyList: '/api/op/v1/device/myList', // 个人信息-自购电脑申请
      applySubmit: '/api/op/v1/device/appliedt/:id', // 自购电脑申请流程
      applyDetail: '/api/op/v1/device/:id', // 自购电脑申请明细
      applyCreate: '/api/op/v1/device', // 保存
      applyDelete: '/api/op/v1/device/del/:ids', // 删除
    },

    reportMgmt: {
      resWork: '/api/org/v1/workRpt/getInfo', // get 查询资源工作数据
      resDemand: '/api/org/v1/reqRpt/getInfo', // get 查询资源需求报表
      timesheetReportList: '/api/org/v1/timesheetReport/list', // g 工时填报报表列表
    },

    prePay: {
      list: '/api/worth/v1/adpay/list', // get 预付款查询
      savePreAccountJde: '/api/worth/v1/adpay/savePreAccount/:adpayApplyIds', // post 保存预付款数据，用于jde数据同步，保存加修改
      activeSubContract: '/api/person/v1/contractActivation/:id', // get 子合同数据
      submitSubContract: '/api/person/v1/twContractActivationView', // post 提交保存子合同数据
      checkSubContract: '/api/person/v1/activation/:id', // get 流程详情页面数据获取
      passSubContractResult: '/api/person/v1/activation/pass', // put 子合同结果请求
    },

    advanceVerification: {
      list: '/api/worth/v1/adpaywriteoff/list', // get 预付款查询列表
      advanceVerificationDetail: '/api/worth/v1/adpaywriteoff/:id', // 预付款详情
      singleList: '/api/worth/v1/adpayhistory/list/:id', // 获取单条预付款的核销记录
      save: '/api/worth/v1/adpaywriteoff/save', // 预付款核销流程保存
    },

    ticketMgmt: {
      list: '/api/op/v1/tripTickets/tripTicketsManage', // get 行政定票管理查询
      batch: '/api/op/v1/tripTickets/initReim/:ids', // 发起报销（批量）
      details: '/api/op/v1/tripTickets/detail/:ids', // get 详情页查询接口
      submit: '/api/op/v1/tripTickets/batchReim/:ids/:payMethod/:abAccId', // 发起报销（批量）

      exportTripTickets: 'api/op/v1/tripTickets/statement/export', // 导出差旅对账表
      exportTripTicketsReim: 'api/op/v1/tripTickets/reim/export', // 导出因公差旅报销表
    },

    vacation: {
      vacationMgmt: '/api/person/v1/vacation', // 假期管理list，新增，修改
      vacationDetail: '/api/person/v1/vacation/:id', // 假期详情
      vacationMgmtDelete: '/api/person/v1/vacation/:ids', // 假期管理删除
      vacationApply: '/api/person/v1/vacationApply', // 假期申请list、新增，修改
      vacationApplyDetail: '/api/person/v1/vacationApply/:id', // 假期申请详情
      vacationUpload: '/api/person/v1/vacation/upload', // 导入假期excel文件
      vacationBuList: '/api/person/v1/vacation/ByBu', // 我的BU假期列表
      queryTemporaryTimeUri: '/api/person/v1/vacationSettings', // 参数配置弹窗查询出有效期
      saveTemporaryTimeUri: '/api/person/v1/vacationSettings', // 参数配置弹窗保存有效期
      batchSaveTemporaryTimeUri: '/api/person/v1/vacationUpdate/:ids', // 批量修改有效期
    },

    distInfoMgmt: {
      list: '/api/worth/v1/profit/list', // get 收益分配管理查询列表
      detail: '/api/worth/v1/profit/find/:id', // get 收益分配详情

      // 利益分配模板字段类型配置
      saveBusinessTableFieldType: '/api/sys/v1/function/saveBusinessTableFieldType', // post 利益分配模板字段类型配置修改
      saveBusinessTableFieldTypeDetail: '/api/sys/v1/function/selectBusinessTableFieldType/:id', // get 利益分配模板字段类型配置详情
      field: '/api/sys/v1/function/field/:id/:pageNo', // get 利益分配模板字段类型配置详情

      // 利益分配模板
      functionList: '/api/sys/v1/function', // get 业务功能下拉框
      proConAndproFac: '/api/sys/v1/function/proConAndproFac/:id', // get 利益分配条件/利益分配对象
      saveUpdateProConAndproFac: '/api/sys/v1/function/saveUpdateProConAndproFac', // post 利益模板新增/修改
      proConAndproFacDetail: '/api/sys/v1/function/selectProConAndproFac/:id', // get 利益模板详情
      proConAndproFacList: '/api/sys/v1/function/profitTemplate', // get 利益分配模板列表
      proConAndproFacDel: '/api/sys/v1/function/profitTemplate/delete/:ids', // delete 利益模板列表删除
      updateProStatus: '/api/sys/v1/function/updateProStatus/:id/:state', // post 利益模板列表改变启用状态
      // 利益分配规则
      templateName: '/api/sys/v1/function/templateName', // get 模板名称下拉框
      profitCondition: '/api/sys/v1/function/profitCondition/:id', // get 利益分配条件
      roleField: '/api/sys/v1/function/roleField/:id', // get 利益分配对象 及比列表头
      saveProfitdistFunction: '/api/sys/v1/function/saveProfitdistFunction', // post 保存/修改

      // 利益分配规则
      templateNameList: '/api/sys/v1/function/templateName/:id', // get 模板名称下拉框
      profitConditionTableCol: '/api/sys/v1/function/profitCondition/:id', // get 利益分配条件和利益分配对象的表头
      profitConditionSave: '/api/sys/v1/function/saveProfitdistFunction', // post 保存/修改
      profitConditionDetail: '/api/sys/v1/function/selectProfitdistFunction', // get 详情
      profitConditionDelete: '/api/sys/v1/function/ProfitFun/delete/:ids/:id', // get 删除
      updateStatus: '/api/sys/v1/function/ProfitFun/updateStatus/:id/:state', // get 改变启用状态
    },

    eval: {
      list: '/api/base/v1/eval/newEvalList', // g 评论列表
      avg: '/api/base/v1/eval/resEval/:resId', // g 评价
    },
    // ====offer发放资源入职申请======
    notSubmitList: '/api/person/v1/res/resEntry?limit=0', // 未提交状态资源列表
    listOfferEntry: '/api/person/v1/offerEntry/listOfferEntry', // 入职流程申请列表
    offerAndRes: '/api/person/v1/offerEntry/saveEntity', // 资源信息保存
    getOfferAndResDetails: '/api/person/v1/offerEntry/detail/:resId', // 资源信息详情
    salesBu: '/api/common/v1/select/bu/bsCat6', // 独立BU
    getOldSaleBu: '/api/person/v1/offerBuIsBs/:resId', // 获取原销售BU
    entryItemList: '/api/person/v1/checkresult/findcheckresult/:twofferId', // 入职事项列表
    itAdmin: '/api/person/v1/offerEntry/itAdmin/:procTaskId', // it管理员节点保存及审批
    findBu: '/api/person/v1/offerEntry/findBu/:buId', // 核验BU是否存在
    checkResult: '/api/person/v1/checkresult/updateresult', // 保存入职事项结果
    changeStatue: '/api/person/v1/checkresult/updateresult/:id', // 更新某条入职事项状态
    checkItemResultList: '/api/person/v1/checkresult/list/:leavId', // 获取离职检查事项
    findCapa: '/api/person/v1/offerEntry/findCapa/:resId', // 检查复合能力
    findJobIsUsed: '/api/person/v1/offerEntry/findJobIsUsed', // 拉取被筛选的简历
    closeFlowForTask6: '/api/person/v1/offer/close', // 入职信息录入节点关闭流程A30-06
    saveEntityAbility: '/api/person/v1/offerEntry/saveEntity/ability', // 入职信息直属领导审批

    // =======外部资源引入流程RES_EXTERNAL_APPLY=========
    extrApplyCreate: '/api/person/v1/res/externalApply', // 外部资源信息保存
    getResApplyListDetails: '/api/person/v1/resExtrApply/:id', // 外部资源信息详情
    checkExtrApplyAbAcc: '/api/person/v1/res/externalApply/abAcc', // 外部资源检查财务信息

    // ==========资源离职申请===========
    leavelApplyList: '/api/person/v1/leaverEntry/leaverList', // 离职流程列表
    leavelDetail: '/api/person/v1/leaveEntry/detail/:id', // 离职资源详情
    resDetail: '/api/person/v1/resEntry/:resId', // 资源详情
    saveEntity: '/api/person/v1/leaverEntry/saveEntity', // 保存提交离职信息
    myVacationList: '/api/person/v1/leaverEntry/myVacationList', // 离职资源剩余假期
    checkresultList: '/api/person/v1/checkresult/list/:id', // 获取离职检查事项
    hrcheckList: '/api/person/v1/checkresult/hrcheck/list/:id/:contractEndDate', // 获取第八节点(离职办理-总部人事专员)离职检查事项(根据解除劳动合同日期生成)
    checkresultUpdate: '/api/person/v1/checkresult/update', // 更改离职检查事项状态、备注等信息

    recruit: '/api/person/v1/recruitJob', // 获取招聘岗位列表 新增 修改
    recruitDelete: '/api/person/v1/recruitJob/:ids', // 删除
    recruitDetail: '/api/person/v1/recruitJob/:id', // 获取招聘岗位详情

    internal: '/api/person/v1/jobInternalRecomm', // 获取内推资源列表
    internalDelete: '/api/person/v1/jobInternalRecomm/:ids', // 删除
    internalDetail: '/api/person/v1/jobInternalRecomm/:id', // 内部推详情
    resPortrayal: '/api/person/v1/res/portrayal/biu/:id', // 资源画像 基本信息
    resPortrayalCapacity: '/api/person/v1/res/portrayal/capacity/:id', // 资源画像 能力
    resPortrayalCertificate: '/api/person/v1/res/portrayal/certificate/:id', // 资源画像 资格证书
    resPortrayalWork: '/api/person/v1/res/portrayal/work/:id', // 资源画像 工作经历
    resPortrayalEvaluationAll: '/api/person/v1/res/portrayal/eveal/:id', // 资源画像 评价-全部
    resPortrayalEvaluationGood: '/api/person/v1/res/portrayal/evealGood/:id', // 资源画像 评价-好评
    resPortrayalEvaluationMiddle: '/api/person/v1/res/portrayal/evealMiddle/:id', // 资源画像 评价-中评
    resPortrayalEvaluationBad: '/api/person/v1/res/portrayal/evealBad/:id', // 资源画像 评价-差评
    resPortrayalEvaluationNew: '/api/person/v1/res/portrayal/evealNew/:id', // 资源画像 评价-最新
    resPortrayalProject: '/api/person/v1/res/portrayal/proj/:id', // 资源画像 项目经验
    resPortrayalTask: '/api/person/v1/res/portrayal/task/:id', // 资源画像 任务履历
    initLeaveChecks: '/api/person/v1/leaverEntry/initLeaveChecks/:resId/:leaveDate', // 初始化通过‘离职处理’进行的离职检查信息
    resLeaveUpdate: '/api/person/v1/res/updateResLeave/:resId/:leaveDate', // 资源列表 离职确认（继续）

    // ==========BaseBU变更申请===========
    BaseBUChange: {
      // queryUserBuInfoUri:'/api/person/v1/baseChange/onTheJob', // 获取在职下拉资源
      getBaseBuInfo: '/api/person/v1/baseChange/baseBu/:id', // 根据资源ID查找baseBU信息和上级资源
      saveBaseBUInfoUri: '/api/person/v1/baseChange', // baseBu变更申请
      submitBaseBUInfoUri: '/api/person/v1/baseChange/apply/pass', // 被拒绝后再提交
      getBaseViewListUri: '/api/person/v1/baseChange/baseView/:id', // 获取详情
      newBaseBuUserPassUri: '/api/person/v1/baseChange/oldBasePUserId/pass', // 原BaseBu上级通过/拒绝
      oldBaseBuUserPassUri: '/api/person/v1/baseChange/oldBaseBuUserId/pass', // 原BaseBu 领导通过/拒绝
      newBasePUserPassUri: '/api/person/v1/baseChange/newBasePUserId/pass', // 新Base地上级资源修改
      oldBasePUserPassUri: '/api/person/v1/baseChange/oldBasePUserId/pass', // 新Base地BU领导资源修改
      newBaseMyUserUri: '/api/person/v1/baseChange/newBaseMyUserId/:id', // 自己审批时获取检查事项
      newBaseMyUserPassUri: '/api/person/v1/baseChange/newBaseMyUserId/pass', // 自己审批时 通过/不通过
      newBaseHrUri: '/api/person/v1/baseChange/newBaseHr/:id', // 人事审批时获取检查事项
      newBaseHrPassUri: '/api/person/v1/baseChange/newBaseHr/pass', // HR审批时 通过/不通过
    },

    pronationList: '/api/person/v1/hr/resProbationPeriodCheck/list', // 试用期考核列表
    pronationDetail: '/api/person/v1/hr/resProbationPeriodCheck/viewById/:userId', // 试用期考核列表详情

    attendance: {
      other: '/api/op/v1/twTattendanceOther/myAttendOther', // g 其它打卡列表
      day: '/api/op/v1/clock/everyDay', // g 按天
      month: '/api/op/v1/clock/everyMonth', // g 按月
      attendanceRemark: '/api/op/v1/clock/rule/attendanceRemark', // g 异常申请记录
      updateRemarkStatus: '/api/op/v1/clock/rule/updateRemarkStatus', // p 补卡审批
      rule: {
        list: '/api/op/v1/clock/ruleList', // g 规则列表
        save: '/api/op/v1/clock/rule', // post 规则新增  put 修改
        detail: '/api/op/v1/clock/rule/:id', // g 规则详情
        del: '/api/op/v1/clock/rule/:ids', // patch 删除规则
      },
      abNormalrule: {
        abNormalList: '/api/common/v1/businessRules/getRuleList', // g 规则列表
        abNormalSave: '/api/common/v1/businessRules/save', // post 规则新增  put 修改
        abNormalUpdate: '/api/common/v1/businessRules/updateRule', // patch 规则更新  put 修改
        abNormalDetail: '/api/common/v1/businessRules/getRule/:id', // g 规则详情
        abNormalDel: '/api/common/v1/businessRules/remove/:ids', // delete 删除规则
        abNormalSwitch: '/api/common/v1/businessRules/switch/:id', // patch 开关
        abNormalInfo: '/api/common/v1/businessRules/getFields/:proType', // get 可用异常表达式
        monthExcel: '/api/op/v1/attendance/monthExcel', // get 月度报表导出
      },
    },

    prefMgmt: {
      examTmplList: '/api/op/v1/examTmpl/find/page', // 模板列表
      examTmplDetails: '/api/op/v1/examTmpl/find/:id', // 模板详情
      examTmplCreate: '/api/op/v1/insert/examTmpl', // 模板新增
      examTmplEdit: '/api/op/v1/update/examTmpl', // 模板修改
      examTmplDelete: '/api/op/v1/deletes/examTmpl/:ids', // 模板删除
      examTmplChangeStatus: '/api/op/v1/changeStatus/examTmpl/:id/:tmplStatus', // 模板启用状态修改

      // 绩效考核发起和流程相关
      getExamTmpl: '/api/op/v1/perforManceExam/getExamTmpl', // 考核模板可用
      examRes: '/api/op/v1/perforManceExam/examRes', // 考核资源信息
      exam: '/api/op/v1/perforManceExam/exam', // 添加考核信息
      examlist: '/api/op/v1/perforManceExam/examlist', // 考核信息列表
      examById: '/api/op/v1/perforManceExam/examById/:id', // 考核信息列表详情
      assessorById: '/api/worth/v1/performance/communicate/assessorViewById/:id', // 获取考核人资源id
      examByIdResList: '/api/op/v1/perforManceExam/examByIdResViews/:id', // 考核信息列表详情的资源列表
      roleList: '/api/common/v1/select/bu/res/role', // 考核范围查询条件角色下拉
      examListChangeStatus: '/api/op/v1/perforManceExam/examStatus/:id/:tmplStatus', // 考核信息列表状态修改
      examCopyDetails: '/api/op/v1/perforManceExam/exam/copy/:id', // 考核信息copy获取详情
      examCreateReview: '/api/op/v1/perforManceExam/procStart', // 发起考核流程
      createPlanComm: '/api/worth/v1/performance/communicate/plan', // 绩效考核沟通流程创建页面 (发起计划考核按钮)
      checkIsPerformanceExam: '/api/worth/v1/performance/communicate/checkPerformanceExam', // 检查绩效考核沟通是否存在流程
      planExamById: '/api/worth/v1/performance/communicate/exam/content', // 查看考核计划
      communicateInfo: '/api/worth/v1/performance/communicate/exam/all/:id', // 流程创建节点的沟通信息

      // 流程详情
      flowDetail: '/api/op/v1/perforManceExam/exam/resEval/:id', // 流程详情
      examineByThree: '/api/op/v1/examineByThree/:taskId', // 绩效考核第三节点审批
      examineByFour: '/api/op/v1/examineByFour/:taskId', // 绩效考核第四节点审批
      gradeExam: '/api/op/v1/perforManceExam/exam/gradeExam/:id/:score', // 绩效考核第四节点输入综合等级获取得分

      // 考核结果相关
      examFinallyList: '/api/op/v1/perforManceExam/examFinally', // 考核结果列表
      examByIdResDetail: '/api/op/v1/perforManceExam/examByIdRes/:id', // 考核结果明细
      examByIdView: '/api/op/v1/perforManceExam/examViewById/:id', // 考核结果详情
      myExamFinallyList: '/api/op/v1/perforManceExam/MyexamFinally', // 个人工作台下考核结果列表

      // 考核沟通
      prefexamList: '/api/worth/v1/performance_communicate/findByConditionPaging', // 绩效考核沟通列表
      prefexamDetail: '/api/worth/v1/performance_communicate/findByKey/:id', // 绩效考核沟通详情
      preexamPlanList: '/api/worth/v1/performance_communicate_res/selectAllByCondition', // 绩效考核计划沟通明细
      preexamContentDetail:
        '/api/worth/v1/performance_communicate_res_content/selectAllByCondition', // 绩效考核沟通内容详情
      assessedSave: '/api/worth/v1/performance/communicate/assessed/save', // 绩效考核沟通被考核人填写通过提交
      assessorSave: '/api/worth/v1/performance/communicate/assessor/save', // 绩效考核沟通考核人填写通过提交
      hrSave: '/api/worth/v1/performance/communicate/hr/save', // 绩效考核沟通hr填写通过提交
      checkassessed: '/api/worth/v1/performance/communicate/assessed', // 查看被考核人填写内容
    },

    // 财务期间管理
    financePeriod: {
      finPeriodAll: '/api/base/v1/select/finPeriodAll', // 财务期间列表 get
      finPeriodInsert: '/api/base/v1/insert/finPeriod', // 财务期间新增 post
      finPeriodUpdate: '/api/base/v1/update/finPeriod', // 财务期间修改 put
      finPeriodDetail: '/api/base/v1/select/finPeriod/:id', // 财务期间详情 get
      finPeriodByIdDelete: '/api/base/v1/delect/finPeriodById/:ids', // 财务期间删除 get
      finYearAll: '/api/base/v1/select/finYearAll', // 财务年度列表 get
    },

    // base地变更
    changeBaseSubmit: '/api/person/v1/baseChange/save', // base地变更申请 post
    changeBaseDetail: '/api/person/v1/baseChange/save/:id', // base地变更流程详情 get

    // 资金划款流程
    getTransferCompany: '/api/common/v1/select/ou/internal/ab', // 获取划款公司
    getTransferAccountById: '/api/common/v1/select/multicol/innerAccountAb/:id', // 根据地址簿号查划款公司银行账号多列下拉
    getCollectionAccountById: '/api/common/v1/select/multicol/innerAccountAb/:id', // 根据地址簿号查划款公司银行账号多列下拉
    getApplicantBuByResId: '/api/common/v1/select/resIdBu/:resId', // 根据选择的申请人获取申请人BU
    transferMoneyList: '/api/worth/v1/money_transfer', // 资金划款列表
    transferMoneyDetail: '/api/worth/v1/money_transfer/:id', // 资金划款详情
    transferMoneyDelete: '/api/worth/v1/money_transfer', // 资金划款删除
    transferMoneyEdit: '/api/worth/v1/money_transfer', // 资金划款新增、修改
    catCode: {
      // 类别码
      catCodeList: '/api/base/v1/category/selectCatList', // 类别码列表查询
      catCodeSave: '/api/base/v1/category/saveEntity', // 类别码列表保存
      catCodeDelete: '/api/base/v1/category/deleteCat/:ids', // 类别码列表删除
      catCodeDetails: '/api/base/v1/category/selectCat/:id', // 类别码列表详情
      // 类别码明细
      catCodeDetailList: '/api/base/v1/category/selectSupCat/:id', // 类别码明细列表、上级类别码列表
      catCodeDetailSave: '/api/base/v1/category/saveCatDEntity', // 类别码明细保存
      catCodeDetailDetele: '/api/base/v1/category/deleteCatD/:ids', // 类别码明细删除
      catCodeDetailDetails: '/api/base/v1/category/selectCatD/:id', // 类别码明细详情
      catCodeDetailTabField: '/api/base/v1/category/selectTabField/:tabName', // 类别码明细表字段下拉
      // 类别码明细值
      catCodeDValDetails: '/api/base/v1/category/selectCatDVal/:id', // 类别码明细值详情
      catCodeDValSave: '/api/base/v1/category/selectCatDVal', // 类别码明细值修改
      catCodeDValInsert: '/api/base/v1/category/insertCatDVal', // 类别码明细值维护
      selectSupCatDVal: '/api/base/v1/category/selectSupCatDVal/:id', // 类别码明细值-上级值下拉列表
      catCodeDValNodeSave: '/api/base/v1/category/insertCatDVal', // 类别码明细值节点新增
      catCodeDValNodeDetele: '/api/base/v1/category/deleteCatDVal/:ids', // 类别码明细值节点删除
    },
    // 查询维度管理
    searchDimension: {
      // 查询维度列表、新增
      searchDimensionList: '/api/base/v1/search/selectSearchList', // 查询维度列表查询
      searchDimensionDelete: '/api/base/v1/search/deleteSearchList/:ids', // 查询维度列表删除
      searchDimensionEdit: '/api/base/v1/search/saveEntity', // 查询维度列表保存
      searchDimensionCatCodeList: '/api/base/v1/search/selectCatId', // 查询维度定义类别码列表
      // 查询维度
      saveSearchDimDetails: '/api/base/v1/search/selectSearch/:id', // 查询维度详情
      saveSearchDimEntity: '/api/base/v1/search/saveSearchDimEntity', // 查询维度保存
      saveSearchDimDetele: '/api/base/v1/search/deleteSearchDim/:ids', // 查询维度删除
      saveSearchDimList: '/api/base/v1/search/selectSearchDim/:id', // 查询维度保存详情列表
      // 查询维度明细
      SearchDimDEntity: '/api/base/v1/search/saveSearchDimDEntity', // 查询维度明细保存
      SearchDimDDelete: '/api/base/v1/search/deleteSearchDimD/:ids', // 查询维度明细删除
      SearchDimDList: '/api/base/v1/search/selectSearchDimD/:id', // 查询维度明细列表
      SearchDimDCatCodeList: '/api/base/v1/search/selectCatDId/:id', // 查询维度明细里类别码下拉列表
    },
    video: {
      videoList: '/api/base/v1/video/selectVideoList', // 视频列表查询
      videoEdit: '/api/base/v1/video/saveEntity', // 视频新增修改
      videoDetail: '/api/base/v1/video/selectVideo/:id/:catNo', // 视频详情
      videoDelete: '/api/base/v1/video/deleteVideo/:ids', // 视频列表删除
      videoCatData: '/api/base/v1/video/selectVCat/:catNo', // 视频类别数据
      selectVideoDrop: '/api/base/v1/video/selectVideoDrop', // 视频大类、视频小类、服务属性
      changeStatus: '/api/base/v1/video/updateShowFlag/:id/:showFlag', // 视频列表修改展示状态
    },
    // 名片申请
    businessCard: {
      saveBusinessCard: '/api/person/v1/cardApply/save', // 提交
      selectFlowDetail: '/api/person/v1//cardApply/select/:id', // 获取流程信息
    },
    // 用印申请
    useSealApply: {
      sealApply: '/api/production/adm/sealApply', // 新增、修改、删除、详情
      sealApplyDetail: '/api/production/adm/sealApply/:id', // 详情
    },
  },
  okr: {
    okrMgmt: {
      implementList: '/api/okr/v1/okr/select', // 实施周期列表
      implementDetail: '/api/okr/v1/okr/select/objective', // 实施周期关联目标详情
      implementEdit: '/api/okr/v1/okr/periodp/save', // 实施周期新增和修改
      implementDel: '/api/okr/v1/okr/periodp/del/:ids', // 实施周期删除(可批量)
      objectiveList: '/api/okr/v1/okr/select/objective', // 目标列表
      objectiveCatUpdate: '/api/okr/v1/okr/catUpdate', // 目标类别码修改
      objectiveSupList: '/api/okr/v1/okr/select/objective/sup', // 目标列表，供上级目标下拉用
      objectiveEdit: '/api/okr/v1/okr/objective/save', // 目标新增和修改目标
      objectiveDetail: '/api/okr/v1/okr/objective/keyresult/:id', // 目标详情
      objectiveDel: '/api/okr/v1/okr/objective/del/:ids', // 目标删除(可批量)
      targetMap: '/api/okr/v1/okr/targetMap', // 目标树状图
      keyResultDetail: '/api/okr/v1/okr/keyresult/:id', // 关键结果详情
      keyresultUpdateDetail: '/api/okr/v1/okr/objective/keyresult/update/:id', // 关键结果进度更新后详情
      kRUpdate: '/api/okr/v1/okr/update/keyresult', // 关键结果进度更新
      objtemp: '/api/okr/v1/okr/objtemp/save', // 新增目标的 新增/更新
      isPre: '/api/okr/v1/okr/queryCharge/:resId', // 判断当前登录人是否是选定资源的上级
      // ==============评价与指导=============
      commentInsert: '/api/okr/v1/okr/comment/insert', // 评论提交
      commentSelect: '/api/okr/v1/okr/comment/select/:id', // 评论提交
      commentSelectDetail: '/api/okr/v1/okr/comment/select/:id/:objectSpeakFlag/:objectResId', // 目标评论与指导的详情接口
      commentLike: '/api/okr/v1/okr/comment/insert/like', // 点赞时调用的API

      // =================OKR打分===================
      targetEvalDetail: '/api/okr/v1/okr/grade/:id', // 目标详情
      targetResultUpdate: '/api/okr/v1/okr/grade/update', // 目标进度确认(下一步)
      saveComment: '/api/okr/v1/okr/grade/save/comment', // 目标结果总结(上一步)
      targetResultFlowDetail: '/api/okr/v1/okr/grade/flow/:id', // 目标打分流程详情
      selectGradeList: '/api/okr/v1/okr/select/grade', // 目标打分结果列表
      targetResultSave: '/api/okr/v1/okr/grade/save', // 目标结果总结(提交发起流程)
      targetResultEvalPass: '/api/okr/v1/okr/grade', // 目标打分结果(通过)
      targetResultFinalEval: '/api/okr/v1/okr/grade/finalEval', // 目标最终结果确认(通过)

      // ===============OKR个人首页================
      userHomeBaseData: '/api/okr/v1/okr/homePage', // OKR个人首页 视图基础数据
      userHomeMyShortCut: '/api/okr/v1/okr/shortCut/my', // okr个人首页 菜单快捷入口
      userHomeObjectiveList: '/api/okr/v1/okr/select/objective/homePage', // okr个人首页 目标列表权限控制
      userHomeTodoTasks: '/api/okr/v1/okr/homePage/todoTasks', // okr个人首页 代办通知部分

      // ===================工作计划=================
      objectiveWorkPlanList: '/api/op/v1/resWorkPlan/selectAllByCondtition', // 工作计划列表(目标id)
      objectiveWorkPlanChntDetails: '/api/op/v1/resWorkPlan/selectById/:id', // 工作计划(根据查询到的id查到这一条详情)
      objectiveWorkPlanChntCreate: '/api/op/v1/resWorkPlan/insert', // 新增工作计划
      objectiveWorkPlanChntUpdate: '/api/op/v1/resWorkPlan/updateOneById', // 工作计划-正泰修改,
      objectiveWorkLogSaveUri: '/api/op/v1/workdiarys/save', // 工作计划 的工作日志保存

      // ===================目标实现路径图===============
      targetPathMap: '/api/okr/v1/okr/pathMap', // 目标实现路径图

      // ===================OKR运营报告===============
      stateStatis: '/api/okr/v1/okrOpeRep/stateStatis', // 目标状态统计
      updateStatis: '/api/okr/v1/okrOpeRep/updateStatis', // 目标更新统计
      getOkrListByStatus: '/api/okr/v1/okrOpeRep/okrStatList', // get 根据目标状态获取 okr 列表
      getOkrListByUpdate: '/api/okr/v1/okrOpeRep/okrUpdList', // get 根据目标更新获取 okr 列表
    },
  },
  hr: {
    tarinResult: {
      tarinResultList: '/api/base/v1/resTrainingProg/select', // 资源培训情况列表
      tarinResultClose: '/api/base/v1/resTrainingProg/update/:ids', // 资源培训情况列表关闭
      updateEnddate: '/api/base/v1/resTrainingProg/updateEndDate', // 修改截止日期
      updateLearningPro: '/api/base/v1/resTrainingProg/updateResTrainingProgCurProg', // 更新学习进度
    },
    fitCheck: {
      fitCheckList: '/api/base/v1/myCapaList/queryByTwResCapaQuery', // 适岗考核列表
      fitCheckListCancel: '/api/base/v1/myCapaList/changeObtainStatusByIds/:ids', // 适岗考核列表取消考核
      fitCheckDel: '/api/base/v1/myCapaList/deleteCapaByIds/:ids', // 适岗考核列表取消考核
      abilityList: '/api/base/v1/resCapaExamLog/queryList', // 适岗考核能力列表
      getUserTrainingProgList: '/api/base/v1/resCapaExamLog/getInUseTrainingProgList', // 新增弹窗获取适岗培训项目
      getcapaSetListByRes: '/api/base/v1/resCapaExamLog/getResCapaSetList/:resId', // 新增弹窗根据资源id获取适岗培训项目
      checkSave: '/api/base/v1/resCapaExamLog/save', //  适岗考核能力列表新增弹窗保存
      cancelCheck: '/api/base/v1/resCapaExamLog/cancel/:id/:type', //  适岗考核能力列表取消考核
      getTrainingList: '/api/base/v1/resCapaExamLog/getTrainingProgList/:id', //  适岗考核能力列表页行 点击 试岗培训  获取 试岗培训列表
      updateCheckStatus: '/api/base/v1/resCapaExamLog/updateStatus', // 更新考核状态
    },
  },
  sys: {
    iam: {
      auth: {
        menu: '/api/iam/navs', // 获取导航信息(菜单、页面、视图)
        tenantMenu: '/api/iam/tenantNavs', // 获取导航信息(菜单、页面、视图) 有用户权限
        allTenantMenu: '/api/iam/allTenantNavs', // 获取导航信息(菜单、页面、视图) 无用户权限
        systemMenu: '/api/iam/systemNavs', // 获取全部菜单
        systemMenuByCode: '/api/iam/systemNav/:code', // 获取全部菜单
        updateNavigation: '/api/iam/systemNav/update', // 修改菜单
        insertNavigation: '/api/iam/systemNav/insert', // 新增菜单
      },
      orgs: {
        orgList: '/eds/api/cds/orgs', // 组织信息来源列表
        orgInfo: '/eds/api/cds/orgs/:id', // 组织信息来源信息
        orgUnits: '/eds/api/cds/orgs/:id/units', // 指定节点的子节点列表
      },
      roles: {
        roles: '/eds/ops/iam/roles', // 角色检索
        navs: '/eds/ops/iam/roles/:id/navs', // 获取角色导航清单
        raabs: '/eds/ops/iam/roles/:id/raabs', // 更新角色导航清单
      },
      users: {
        users: '/eds/ops/iam/users', // 更新角色能力清单
        usersRes: '/eds/ops/iam/users/res', // 用户列表(包含资源ID)
        raabs: '/eds/ops/iam/users/:id/raabs', // 获取用户额外能力清单
        roles: '/eds/ops/iam/users/:id/roles', // 更新用户角色清单
        userFlowRoles: '/api/op/v1/users/:id/bpm/roles', // 获取用户流程角色清单
        flowRoles: '/api/op/v1/users/bpm/roles', // g/p 流程角色清单
        resetPwd: '/api/iam/pwd/reset', // p 重制密码
      },
      raabs: {
        domains: '/eds/ops/iam/domains', // 获取领域清单
        domainRaabs: '/eds/ops/iam/domains/:id/raabs', // 获取领域能力清单
        raabs: '/eds/ops/iam/raabs', // 查找能力清单
        raabPerms: '/eds/ops/iam/raabs/:id/perms', // 获取能力许可清单
      },
      org: {
        ops: '/eds/api/iam/orgs', // 组织树
        getUnitPersonsUsingGET: '/eds/api/iam/orgs/:id', // 组织人员列表
      },
    },
    flow: {
      flowRoles: '/api/sys/v1/flowroles', // 流程角色 get
      flowRole: '/api/sys/v1/flowrole/:id', // get 获取单个角色信息
      flowRoleModified: '/api/sys/v1/flowrole', // 新增/修改 put
      flowRoleDelete: '/api/sys/v1//flowrole/d', // 删除 patch
      flowVersionList: '/api/base/v1/procExplain/getVerInfo/:key', // 单个流程名的版本历史  get
      versionItemByVersionTag: '/api/base/v1/procExplain/getExplainByKey/:procKey', // get 根据流程key和版本号 获取流程说明信息
      saveExplain: '/api/base/v1/procExplain/saveExplain', // 保存流程说明信息
    },
    system: {
      timedTaskList: '/api/common/v1/schedule/list', // get 获取列表
      timedTaskStart: '/api/common/v1/schedule/start/{taskCode}', // put 启动任务
      timedTaskStop: '/api/common/v1/schedule/stop/{taskCode}', // put 停止任务
      timedTaskEdit: '/api/common/v1/schedule/cron', // post 新增或者修改任务
      timedTaskDetail: '/api/common/v1/schedule/{code}', // get 拉取定时任务详情
      timedTaskQuickStart: '/api/common/v1/schedule/effective', // put 立即生效
      timedTaskNowStart: '/api/common/v1/schedule/:code', // put 立即执行

      helpPageCreateUri: '/api/sys/v1/poe_help_page', // post 创建帮助页面
      helpPageModifyUri: '/api/sys/v1/poe_help_page', // put 修改帮助页面
      helpPageDetailUri: '/api/sys/v1/poe_help_page/:id', // get 帮助页面详情
      helpPageListPagingUri: '/api/sys/v1/poe_help_page', // get 帮助页面列表
      helpPageLogicalDeleteUri: '/api/sys/v1/poe_help_page', // patch 帮助页面 逻辑删除
      helpPagePreviewByUrlUri: '/api/sys/v1/poe_help_page/previewByUrl', // get 通过url预览帮助页面
      helpPageTreeUri: '/api/sys/v1/poe_help_page/tree', // get 帮助页面树
      helpPageUpdateDirectoryVisibleUri: '/api/sys/v1/poe_help_page/updateDirectoryVisible', // patch 帮助页面修改目录可见性

      helpDirectoryCreateUri: '/api/sys/v1/poe_help_directory', // post 创建帮助目录页面
      helpDirectoryModifyUri: '/api/sys/v1/poe_help_directory', // put 修改帮助目录页面
      helpDirectoryDetailUri: '/api/sys/v1/poe_help_directory/:id', // get 帮助目录页面详情
      helpDirectoryListPagingUri: '/api/sys/v1/poe_help_directory', // get 帮助目录页面列表
      helpDirectoryLogicalDeleteUri: '/api/sys/v1/poe_help_directory', // patch 帮助目录页面 逻辑删除
      helpDirectoryTreeUri: '/api/sys/v1/poe_help_directory/tree', // get 帮助目录树

      systemFunctionCreateUri: '/api/sys/v1/system_function', // post 创建帮助目录页面
      systemFunctionModifyUri: '/api/sys/v1/system_function', // put 修改帮助目录页面
      systemFunctionDetailUri: '/api/sys/v1/system_function/:id', // get 帮助目录页面详情
      systemFunctionListPagingUri: '/api/sys/v1/system_function', // get 帮助目录页面列表
      systemFunctionLogicalDeleteUri: '/api/sys/v1/system_function', // patch 帮助目录页面 逻辑删除

      // 租户管理
      tenantCreateUri: '/api/sys/v1/tenant', // post 创建
      tenantModifyUri: '/api/sys/v1/tenant', // put 修改
      tenantDetailUri: '/api/sys/v1/tenant/:id', // get 详情
      tenantListPagingUri: '/api/sys/v1/tenant', // get 列表
      tenantLogicalDeleteUri: '/api/sys/v1/tenant', // patch 逻辑删除

      // 租户流程管理
      tenantProcInsert: '/api/base/v1/tenantProc/insert', // post 新增
      tenantProcOverall: '/api/base/v1/tenantProc/overall', // put 全量修改
      tenantProcPartial: '/api/base/v1/tenantProc/partial', // put 指定修改
      tenantProcLogicDel: '/api/base/v1/tenantProc/logicDel/:ids', // patch 逻辑删除
      tenantProcListPaging: '/api/base/v1/tenantProc/paging', // get 列表
      tenantProcDetail: '/api/base/v1/tenantProc/detail/:id  ', // get 详情
      getCurTenProcUri: '/api/base/v1/tenantProc/getCurTenProc', // get 获取当前租户的流程

      // 租户菜单管理
      navTenantCreateUri: '/api/sys/v1/nav_tenant', // post 创建
      navTenantModifyUri: '/api/sys/v1/nav_tenant', // put 修改
      navTenantDetailUri: '/api/sys/v1/nav_tenant/:id', // get 详情
      navTenantListPagingUri: '/api/sys/v1/nav_tenant', // get 列表
      navTenantLogicalDeleteUri: '/api/sys/v1/nav_tenant', // patch 逻辑删除
      navTenantManageUri: '/api/sys/v1/nav_tenant/manage', // patch 租户菜单管理
      navTenantDetailByCodeUri: '/api/sys/v1/nav_tenant/code/:code', // get 详情

      // 简单数据仓库
      dataMartUri: '/api/sys/v1/dataMart/:id', // get 获取数据超市
      // 数据集
      dataMartCreateUri: '/api/sys/v1/data_mart', // post 创建数据集页面
      dataMartModifyUri: '/api/sys/v1/data_mart', // put 修改数据集页面
      dataMartDetailUri: '/api/sys/v1/data_mart/:id', // get 数据集页面详情
      dataMartListPagingUri: '/api/sys/v1/data_mart', // get 数据集页面列表
      dataMartLogicalDeleteUri: '/api/sys/v1/data_mart', // patch 数据集页面 逻辑删除

      // 图表配置
      dataChartCreateUri: '/api/sys/v1/data_chart', // post 创建
      dataChartModifyUri: '/api/sys/v1/data_chart', // put 修改
      dataChartDetailUri: '/api/sys/v1/data_chart/:id', // get 详情
      dataChartListPagingUri: '/api/sys/v1/data_chart', // get 列表
      dataChartLogicalDeleteUri: '/api/sys/v1/data_chart', // patch 逻辑删除
      dataChartAllByNoUri: '/api/sys/v1/data_chart/allByNo/:no', // get 根据编号查询所有数据

      // 数据抽取
      dataExtractCreateUri: '/api/sys/v1/data_extract', // post 创建
      dataExtractModifyUri: '/api/sys/v1/data_extract', // put 修改
      dataExtractDetailUri: '/api/sys/v1/data_extract/:id', // get 详情
      dataExtractListPagingUri: '/api/sys/v1/data_extract', // get 列表
      dataExtractLogicalDeleteUri: '/api/sys/v1/data_extract', // patch 逻辑删除
      dataExtractRunUri: '/api/sys/v1/data_extract/run/:no', // patch 立即执行同步程序

      // 数据展现
      dataPresentCreateUri: '/api/sys/v1/data_present', // post 创建
      dataPresentModifyUri: '/api/sys/v1/data_present', // put 修改
      dataPresentDetailUri: '/api/sys/v1/data_present/:id', // get 详情
      dataPresentListPagingUri: '/api/sys/v1/data_present', // get 列表
      dataPresentLogicalDeleteUri: '/api/sys/v1/data_present', // patch 逻辑删除

      // 数据仓库表 data_warehouse_table dataWarehouseTable
      dataWarehouseTableCreateUri: '/api/sys/v1/data_warehouse_table', // post 创建
      dataWarehouseTableModifyUri: '/api/sys/v1/data_warehouse_table', // put 修改
      dataWarehouseTableDetailUri: '/api/sys/v1/data_warehouse_table/:id', // get 详情
      dataWarehouseTableListPagingUri: '/api/sys/v1/data_warehouse_table', // get 列表
      dataWarehouseTableLogicalDeleteUri: '/api/sys/v1/data_warehouse_table', // patch 逻辑删除

      // 数据仓库表数据 data_warehouse dataWarehouse
      dataWarehouseCreateUri: '/api/sys/v1/data_warehouse', // post 创建
      dataWarehouseModifyUri: '/api/sys/v1/data_warehouse', // put 修改
      dataWarehouseDetailUri: '/api/sys/v1/data_warehouse/:id', // get 详情
      dataWarehouseListPagingUri: '/api/sys/v1/data_warehouse', // get 列表
      dataWarehouseLogicalDeleteUri: '/api/sys/v1/data_warehouse', // patch 逻辑删除

      // 业务检查
      businessCheckCreateUri: '/api/sys/v1/business_check',
      businessCheckModifyUri: '/api/sys/v1/business_check',
      businessCheckDetailUri: '/api/sys/v1/business_check/:id',
      businessCheckListPagingUri: '/api/sys/v1/business_check',
      businessCheckLogicalDeleteUri: '/api/sys/v1/business_check',
      businessCheckSwitchChangeUri: '/api/sys/v1/business_check/switchChange',

      businessPageCreateUri: '/api/sys/v1/business_page', // post 创建页面配置页面
      businessPageModifyUri: '/api/sys/v1/business_page', // put 修改页面配置页面
      businessPageDetailUri: '/api/sys/v1/business_page/:id', // get 页面配置页面详情
      businessPageListPagingUri: '/api/sys/v1/business_page', // get 页面配置页面列表
      businessPageLogicalDeleteUri: '/api/sys/v1/business_page', // patch 页面配置页面 逻辑删除
      selectBusinessTableConditionalUri: '/api/common/v1/select/conditional/businessTable', // 可配置化业务表下拉
      businessTableFieldsUri: '/api/sys/v1/businessTableFields/tableId/:tableId', // 可配置化业务表字段列表
      businessPageBlockSaveOrUpdateUri: '/api/sys/v1/businessPageBlock/saveOrUpdate', // 可配置化业务页面区域保存
      businessPageBlockDetailUri: '/api/sys/v1/businessPageBlock/pageId/:pageId', // 可配置化业务页面区域详情
      businessPageButtonListUri: '/api/sys/v1/businessPageButton/pageId/:pageId', // 可配置化业务页面按钮列表
      businessPageButtonSaveOrUpdateUri: '/api/sys/v1/businessPageButton/saveOrUpdate', // 可配置化业务页面区域保存
      businessPageTabSaveOrUpdateUri: '/api/sys/v1/businessPageTab/saveOrUpdate', // 可配置化业务页面区域保存
      businessPageDetailByNoUri: '/api/sys/v1/business_page/pageNo/:pageNo', // get 根据编号获取页面配置页面详情
      businessPageDetailByNosUri: '/api/sys/v1/business_page/pageNos/:pageNos', // get 根据编号获取多个配置页面
      businessPagePermissionSaveOrUpdateUri: '/api/sys/v1/businessPagePermission/saveOrUpdate', // 保存权限
      businessPagePermissionDeleteUri: '/api/sys/v1/business_permission', // patch 页面配置页面权限 删除
      businessPageFieldTypePermissionUri: '/api/sys/v1/business_field_type_permission', // udc 值权限下拉
      businessPageTabChooseUri: '/api/sys/v1/business_page/tabChoose', // 新建可配置化业务页面标签页UDC选择-可选/不可选 POST
      businessPageSceneUri: '/api/sys/v1/business_page/pageScene', // 场景管理
      businessPageSceneDeleteUri: '/api/sys/v1/business_page/pageScene/:ids',
      businessSceneDetailUri: '/api/sys/v1/business_page/pageScene/:sceneId', // 根据场景主键查询场景详情和页面信息 场景ID

      // 消息通知配置
      sendMessageByNoUri: '/api/sys/v1/message_configuration/sendMessageByNo', // get 根据编号发送消息
      messageConfigListUri: '/api/sys/v1/message_configuration', // 消息通知配置列表查询
      messageConfigInsertUri: '/api/sys/v1/message_configuration', // 新增消息通知配置
      messageConfigUpdateUri: '/api/sys/v1/message_configuration', // 修改消息通知配置
      messageConfigDetailUri: '/api/sys/v1/message_configuration/:id', // 消息通知配置详情
      messageConfigDeleteUri: '/api/sys/v1/message_configuration/:ids', // 删除消息通知配置
      queryMessageTagUri: '/api/sys/v1/message/tag/select', // 查询消息标签-用于消息配置
      messageTagListUri: '/api/sys/v1/message_tag', // 分页查询消息标签
      messageTagInsertUri: '/api/sys/v1/message_tag', // 新建消息标签
      messageTagDeleteUri: '/api/sys/v1/message_tag/:ids', // 删除消息标签
      messageTagDetailUri: '/api/sys/v1/message_tag/:id', // 根据主键查询消息标签
      messageShieldingListUri: '/api/sys/v1/message_shield', // 分页查询消息屏蔽
      messageShieldingInsertUri: '/api/sys/v1/message_shield', // 新建消息屏蔽
      messageShieldingDeleteUri: '/api/sys/v1/message_shield/:ids', // 删除消息屏蔽
      messageShieldingDetailUri: '/api/sys/v1/message_shield/:id', // 根据主键查询消息屏蔽
      queryRelaeseSourceUri: '/api/sys/v1/message/shield/configuration', // 消息屏蔽-查询发布来源(用于下拉框，包含消息编码)
      queryRolesUri: '/api/common/v1/select/roleCode', // 发布范围指定角色的下拉数据来源

      // 琅琊榜榜单功能
      topList: '/api/person/v1/topList/select', // 列表查询
      topListDetail: '/api/person/v1/topList/select/:id', // 列表详情
      getTopListDetail: '/api/person/v1/topList/:udcVal', // 切换数据源拉取榜单明细
      topListSave: '/api/person/v1/topList/saveEntity', // 榜单维护
      topListDelete: '/api/person/v1/topList/delete/:ids', // 列表删除
      changeShowFlag: '/api/person/v1/topList/saveEntity/:id/:showFlag', // 榜单列表更改是否显示状态
      topListdate: '/api/person/v1/topList/selectTopListdate', // 琅琊榜展示
      topListdateDetail: '/api/person/v1/topList/topListdate/:id', // 琅琊榜更多详情展示

      // 薪资成本配置规则
      getCostRuleCfg: '/api/sys/v1/costRuleCfg', // 薪资成本配置规则查询
      postCostRuleCfg: '/api/sys/v1/saveCostRuleCfg', // 薪资成本配置规则保存
      costRuleAbSupp: '/api/sys/v1/costRuleAbSupp', // 薪资成本配置供应商下拉

      // 权限总览
      relateUsersListUri: '/api/person/v1/roleCode/userCodeList', // 功能维护右侧显示的用户列表  对应角色及用户
      usersListUri: '/api/person/v1/roleCode/userList', // 用户维度对应的左侧用户列表
      menuListUri: '/api/person/v1/roleCode/funtionList', // 用户维度对应的右侧第一个页签菜单权限
      dataListUri: '/api/person/v1/roleCode/jurisdList', // 用户维度对应的右侧第二个页签数据权限
      flowListUri: '/api/person/v1/roleCode/bpmList', // 用户维度对应的右侧第三个页签流程权限
    },
    setting: {
      clearCache: '/api/common/v1/select/clear/cache', // get 清除下拉缓存
    },
    menuConfig: {
      menuConfigList: '/api/sys/v1/mob/function/list', // g 获取菜单配置列表
      menuConfigCreate: '/api/sys/v1/mob/function', // post 新增
      menuConfigEdit: '/api/sys/v1/mob/function', // put 修改
      menuConfigInfo: '/api/sys/v1/mob/function/{id}', // g 单个查询
      menuConfigDelete: '/api/sys/v1/mob/function/{id}', // delete 删除菜单
    },
    homeConfig: {
      homeConfigList: '/api/common/v1/orkBench/orkBenchList', // g 获取工作台列表
      setHomePage: '/api/common/v1/orkBench/updateStatus/{id}', // g 修改默认工作台
      homeConfigNavList: '/api/common/v1/orkBench/navList', // g 获取工作台列表
      menuList: '/api/common/v1/orkBench/list', // g 快捷菜单列表
      createMenu: '/api/common/v1/orkBench/insert', // p 新建菜单
      editMenu: '/api/common/v1/orkBench/update', // p 修改菜单
      deleteMenu: '/api/common/v1/orkBench/del/{id}', // d 删除数据
      menuInfo: '/api/common/v1/orkBench/sel/{id}', // g 获取菜单详情
      homePageConfigInfo: '/api/common/v1/orkBench/statusIsYes', // g 获取工作台配置信息
      // logo config
      insertLogo: '/api/common/v1/logWork/insert', // post 新增 logo
      logoInfo: '/api/common/v1/logWork/select', // get 获取 logo 详情
      updateLogo: '/api/common/v1/logWork/update', // put 更新 logo 详情
      // extension config
      extensionList: '/api/common/v1/logMenu/list', // get 获取辅助菜单列表
      insertExtension: '/api/common/v1/logMenu/insert', // post 新增辅助菜单
      getExtensionInfo: '/api/common/v1/logMenu/select/{id}', // get 获取辅助菜单详情
      updateExtension: '/api/common/v1/logMenu/update', // put 修改辅助菜单
      deleteExtensionMenu: '/api/common/v1/deleteMenuById/{id}', // DELETE 删除辅助菜单
      // get logo  And extension config
      logoAndExtensionInfo: '/api/common/v1/logoAndMenuWork/select', // get 获取 logo 及 extensionMenu 数据
    },
    // baseinfo
    subjtemplates: '/api/base/v1/subj/temps', // gj/p 科目模板查询/新增
    subjtemplate: '/api/base/v1/subj/temps/:id', // gj/u 科目模板详情/修改
    subjtempDel: '/api/base/v1/subj/temps/del/:ids', // s 科目模板批量删除
    subjtempStatus: '/api/base/v1/subj/temps/status/:ids/:status', // s 科目模板批量修改状态
    subjtemplateDetails: '/api/base/v1/subj/temps/tempds', // gj 科目模板子表查询

    accMasTree: '/api/common/v1/acc/mas/tree', // g 财务模板树
    accTmplSelect: '/api/common/v1/select/acc/tmpl', // g 科目模板下拉数据
    buTmplResSelect: '/api/common/v1/select/tmpl/res', // g bu模板资源下拉数据
    buTmplRoleSelect: '/api/common/v1/select/tmpl/role', // g bu模板角色下拉数据

    butemplates: '/api/base/v1/bu/temps', // gj/p bu模板查询/新增
    butemplate: '/api/base/v1/bu/temps/:id', // gj/u bu模板详情/修改
    butempDel: '/api/base/v1/bu/temps/del/:ids', // s bu模板批量删除
    butempStatus: '/api/base/v1/bu/temps/status/:ids/:status', // s bu模板批量修改状态
    butmplRoles: '/api/base/v1/bu/temps/roles', // gj/u bu模版_角色信息
    butmplIncomes: '/api/base/v1/bu/temps/eqvas', // gj/u bu模版_资源当量收入
    butmplEqvas: '', // bu模版_结算当量
    butmplOperations: '/api/base/v1/bu/temps/prod/classes', // g bu模版_经营范围
    butmplexamPeriods: '/api/base/v1/bu/temps/exam/periods', // g bu模版_考核期间
    butmplSaveOperation: '/api/base/v1/bu/temps/operation', // u 保存 bu模板_经营信息

    queryProdsList: '/api/base/v1/buProd/prodManager/list', // gf  产品列表
    queryProductById: '/api/base/v1/buProd/prodManager/prod/:id', // gj/u 产品详情
    saveProduct: '/api/base/v1/buProd/prodManager/prod/save', // gj/p 产品新增/修改
    saveProductCat: '/api/base/v1/buProd/prodManager/prod/saveCat', // gj/p 产品新增/修改

    prodClassesList: '/api/base/v1/prodClass/list', // gf  产品分类列表
    prodClassesTree: '/api/base/v1/prodClass/tree', // gf  产品分类树
    prodClassesTreeSub: '/api/base/v1/prodClass/tree/:pId', // gf  根据父类获取产品分类树
    deleteProdClass: '/api/base/v1/prodClass/delete', // s 产品分类删除
    addProdClass: '/api/base/v1/prodClass/add', // pf 产品分类新增
    updateProdClass: '/api/base/v1/prodClass/update', // uf 产品分类更新

    queryProductList: '/api/base/v1/buProd/showRoom/list', // gf  产品列表(无分页)
    queryProdCaseList: '/api/base/v1/buProd/getProdCases', // gf  产品成功案例
    putaway: '/api/base/v1/buProd/prodManager/updateProdStatus/:ids', // s 产品上架
    soldOut: '/api/base/v1/buProd/prodManager/updateInspectFlag/:ids', // s 产品下架
    enterInspect: '/api/base/v1/buProd/prodManager/doInspect/:id', // s 产品考察
    outInspect: '/api/base/v1/buProd/prodManager/finishInspect/:id', // s 产品结束考察
    deleteProduct: '/api/base/v1/buProd/prodManager/del/:ids', // s 产品删除
    saveProductCate: '/api/base/v1/buProd/prodManager/prod/saveCat', // p 产品类别码修改
    saveProdCaseList: '/api/base/v1/buProd/prodManager/prodCase/save', // p 产品类别码修改

    selectWorkHoursByDateUri: '/api/base/v1/vacation/workHours', // g 查询假期列表
    queryVacationList: '/api/base/v1/vacation/{year}', // g 查询假期列表
    queryJdeExportList: '/api/base/v1/jde/export/{year}', // g 查询JDE工时日期设置
    saveVacation: '/api/base/v1/vacation/save', // g 保存假期
    saveJdeExport: '/api/base/v1/jde/export/save', // g 保存JDE导出配置

    // eqvacost
    eqvaCosts: '/api/base/v1/eqva/costs', // gj/p/ 当量成本列表/新增
    eqvaCost: '/api/base/v1/eqva/costs/:id', // gj/u 当量成本详情/修改
    eqvaCostDel: '/api/base/v1/eqva/costs/del/:ids', // s 当量成本批量删除

    // finance
    finyearsSelect: '/api/common/v1/select/finyear', // gj/ 财务年度下拉数据
    finperiodsSelect: '/api/common/v1/select/finperiod/:finYear', // gj/ 财务期间By财务年度下拉数据

    // settlePrice
    settlePrices: '/api/base/v1/settle/prices', // gj/p/ 当量结算定价列表/新增
    settlePrice: '/api/base/v1/settle/prices/:id', // gj/u 当量结算定价详情/修改
    settlePriceDel: '/api/base/v1/settle/prices/del/:ids', // s 当量结算定价批量删除

    profitdistRules: '/api/base/v1/profitdist/rules', // gj/p/ 利益分配规则列表/新增
    profitdistRule: '/api/base/v1/profitdist/rules/:id', // gj/u 利益分配规则详情/修改
    profitdistRuleDel: '/api/base/v1/profitdist/rules/del/:ids', // s 利益分配规则批量删除

    // ab
    abAccs: '/api/base/v1/ab/accs', // gj/p/ 地址簿银行账户列表/新增
    abAcc: '/api/base/v1/ab/accs/:id', // gj/u 地址簿银行账户详情/修改
    abAccDel: '/api/base/v1/ab/acc/del/:ids', // s 地址簿银行账户批量删除
    abAccsByRes: '/api/base/v1/ab/accs/res', // gj/p/ 地址簿银行账户新增 - 资源
    abAccByRes: '/api/base/v1/ab/accs/res/:id', // gj/u 地址簿银行账户修改 - 资源
    myAcc: '/api/base/v1/ab/accs/myAcc', // g 个人财务信息

    // system
    users: '/api/iam/v1/ops/users', // gj/p 用户管理
    user: '/api/iam/v1/ops/users/:id', // gj/u 用户详情
    userStatu: '/api/iam/v1/ops/users/:id/:statu', // s 用户详情
    usersSelect: '/api/common/v1/select/user', // gj/ 用户下拉数据
    usersSelectAll: '/api/common/v1/select/user/all', // 拉去所有用户数据
    udc: {
      udcList: '/api/sys/v1/udc/def', // g UDC 查询 -- 列表 / post UDC 更新 -- 新增 / patch UDC 更新 -- 保存
      udcDetail: '/api/sys/v1/udc/def/:defId', // g UDC 查询 -- 详情
      udcSelect: '/api/common/v1/select/multicol/udc', // g UDC 查询 -- 详情
      udcDetailList: '/api/sys/v1/udc/val/:defId', // g UDC分类码查询 -- 列表
      udcDetailCreate: '/api/sys/v1/udc/val', // post UDC分类码更新 -- 新增 / PATCH UDC分类码更新 -- 保存 / DELETE UDC分类码列表 -- 删除
    },
    // cms 管理
    cmsList: '/api/sys/v1/cms/page',
    cms: '/api/sys/v1/cms',
    cmsDetail: '/api/sys/v1/cms/:id',
    cmsDelete: '/api/sys/v1/cms/:ids',
    // 数据权限
    datapower: {
      datapower: '/api/sys/v1/data/power', // g/p 角色数据功能查询/新增编辑
      list: '/api/sys/v1/data/power/s', // g/p 数据功能清单
      clean: '/api/sys/v1/data/power/clean', // 清除权限缓存
      updateStatus: '/api/sys/v1/data/power/status', // 停用（更新数据权限状态）
      updateStrategy: '/api/sys/v1/data/power/:id/:strategy', // 更新权限规则
      delDatapower: '/api/sys/v1/data/power/:ids', // 删除角色权限
      delRoleDatapower: '/api/sys/v1/data/role/:roleCode', // 删除某个角色的数据权限
      addRoleDatapower: '/api/sys/v1/data/power/:roleCode/:strategy', // 新增某个角色数据权限
      selectRoles: '/api/sys/v1/data/power/role', // 所有角色的单列下拉
      selectRolesByBaseBuId: '/api/sys/v1/data/power/role/:baseBuId', // 角色的单列筛选下拉
    },
    // 评论
    eval: {
      evalMainId: '/api/base/v1/evalMas/:id', // g 评论主数据单条
      evalMainList: '/api/base/v1/evalMas/evalMasList', // g 评论主数据列表
      evalMainSave: '/api/base/v1/evalMas/save', // p 评论主数据保存
      evalPointId: '/api/base/v1/evalPointMas/:id', // g 评论点单条
      evalPointList: '/api/base/v1/evalPointMas/evalMasPointList', // g 评论点列表
      evalPointSave: '/api/base/v1/evalPointMas/save', // p 评论点保存
      evalPointselect: '/api/common/v1/select/evalPoint', // p 评论点保存
      evalPointStatus: '/api/base/v1//evalPointMas/:id/:status', // post 评价状态修改
    },
    banner: {
      getBannerList: '/api/sys/v1/banner/list',
      addBanner: '/api/sys/v1/banner/save',
      getBannerDetails: '/api/sys/v1/banner/detail/:id',
      BannerDelete: '/api/sys/v1/banner/delete/:ids',
    },
    elSound: {
      getElSoundList: '/api/op/v1/article/list',
      addElSound: '/api/op/v1/article/save',
      getElSoundDetails: '/api/op/v1/article/:id',
      elSoundDelete: '/api/op/v1/article/del/:ids',
    },

    // 报表导航
    report: {
      reportNav: '/api/common/v1/report/show/root', // g 报表导航
      getRelated: '/api/common/v1/report/getRelated/:id', // g 获取关联报表
      getParam: '/api/common/v1/report/getParam/:code', // g 获取报表的查询条件
      reportList: '/api/common/v1/report/list', // g 列表查询
      reportSave: '/api/common/v1/report/saveReport', // put 新增、修改
      reportDetail: '/api/common/v1/report/getReportById/:reportId', // g 详情页
      reportDelete: '/api/common/v1/report/del/:ids', // delete 删除
      reportSelect: '/api/common/v1/select/report', // g 关联报表下拉
      roleList: '/api/common/v1/report/role/list/:reportCode/:paramId', // g 权限列表查询
      roleSave: '/api/common/v1/report/role/save/:reportCode/:paramId', // put 权限新增
      roleCodeSelect: '/api/common/v1/select/roleCode', // g 角色下拉
      reportUpload: '/api/common/v1/report/upload', // post 报表上传
      reportBaseUrl: '/api/common/v1/report/:reportCode', // post 报表上传
    },
  },
  demo: {
    province: '/api/geographic/province',
    city: '/api/geographic/city/:province',
    notice: '/api/project/notice',
    activities: '/api/activities',

    prod: {
      // 单表维护场景
      testMainCreateUri: '/api/production/testMain', // post
      testMainOverallModifyUri: '/api/production/testMain/overall', // put
      testMainPartialModifyUri: '/api/production/testMain/partial', // put
      testMainDetailUri: '/api/production/testMain/:id', // get
      testMainListPagingUri: '/api/production/testMain/paging', // get
      testMainLogicalDeleteUri: '/api/production/testMain', // patch
    },
  },
  common: {
    udc: '/eds/api/cds/udcs/:code/vals', // g/ 获取udc
    // menu: '/api/menu', // g/ 获取menu
    terms: '/api/ctg/terms', // g/ 支付条款
    unit: '/api/unit_ranks', // g/ 计量单位
    cascaderUdc: '/api/common/v1/udc/items', // g/ 级联udc
    getBuList: '/api/op/v1/select/allStatusBu', // get 获取全部 Bu List
  },
  ops: {
    rmcache: '/api/cache/x', // cf/ 清除后端缓存
    log: '/api/sync/dataSyncLogs', // gf/ 导入错误日志
    check: '/api/actuator/health', // gf/ 系统加载状况
    maps: '/api/actuator/mappings', // gf/ 系统controller
  },
  sfs: {
    fileUpload: '/api/common/v1/attachment/upload', // 文件通用上传
    fileDelete: '/api/common/v1/attachment/delete', // 文件删除
    fileDownload: '/api/common/v1/attachment/:key', // 附件下载id
    filePreview: '/api/common/v1/attachment/preview/:key', // 文件预览
    getAttachments: '/api/common/v1/attachment/getAttachments', // 查询业务单据的附件列表
    repo: '/eds/api/sfs/repo', // 资料库信息
    list: '/eds/api/sfs/items', // 资料列表
    upload: '/eds/api/sfs/upload', // 文件上传（单个/多个）
    download: '/eds/api/sfs/item', // 资料下载/预览文件
    delete: '/eds/api/sfs/item/x', // 资料删除
    packDownload: '/eds/api/sfs/pack', // 资料打包下载
    copy: '/eds/api/sfs/copy', // 资料复制
  },
  bpm: {
    procs: '/eds/ops/bpm/defs', // get - 流程查询 post - 流程部署
    unload: '/eds/ops/bpm/keys/:id', // 流程卸载(defKey) delete
    unloadForce: '/eds/ops/bpm/keys/:id/force', // 流程强制卸载(defKey) delete
    tasks: '/eds/ops/bpm/defs/:id/tasks', // 获取流程任务定义列表(defId) get
    cc: '/eds/ops/bpm/defs/:id/tasks/:taskKey/cc', // 指定知会任务的工作安排(taskDefId) get | put
    to: '/eds/ops/bpm/defs/:id/tasks/:taskKey/to', // 指定待办任务的工作安排(taskDefId) get | put
    doTask: '/eds/api/bpm/tasks/:id', // 完成流程任务 post
    revoke: '/eds/api/bpm/procs/:id/revoke', // 发起人流程撤回(procId, NG_BPM_REVOKE)
    cancel: '/eds/api/bpm/procs/:id', // delete 流程取消(procId)
    chApprover: '/eds/api/bpm/proc/chaAssProc/:procIds/:userIds', // 变更审批人
    changeAssigneeByTaskId: '/eds/api/bpm/proc/changeAssigneeByTaskId/:taskIds/:userIds', // 根据流程节点id变更审批人
    chAllApprover: '/eds/api/bpm/proc/chaAssAll/:userIdF/:userIdT', // 批量变更审批人
    versionItemByProcId: '/api/base/v1/procExplain/getExplain/:procId', // 根据流程实例id 获取流程说明信息
    submitOrAppr: '/api/flow/bpm/process/process/submitOrAppr', // 流程提交、重新提交、审批、支持会签节点的审批
  },
  bpmn: {
    // getConfig: '/api/op/v1/task-def/:id', // 拉取 taskKey，用于下一步的拉取 viewConf
    // configById: '/eds/ops/bpm/doc_views/taskId/:id', // 拉取流程配置 get
    configById: '/eds/ops/bpm/doc_views_version/taskId/:id', // 拉取对应流程图版本的流程配置 get
    configByKey: '/eds/ops/bpm/doc_views/taskKey/:id', // 拉取流程配置 get
    logs: '/eds/api/bpm/procs/:id/logs', // 工作日志 get
    model: '/eds/api/bpm/procs/:id/bpmn', // 流程模型 get
    getFlowInfo: '/api/op/v1/proc/redirect-info', // get 根据单据ID、流程定义key，获取流程跳转信息
    getMutiFlowInfo: '/api/op/v1/proc/redirect-info-muti', // get 根据单据ID、流程定义key，获取流程跳转信息
  },
  bpmFlow: {
    // 工作流业务相关的 bpm api
    lead: {
      leadsSubmit: '/api/op/v1/leads/proc/start/:id', // 线索提交
    },
    reim: {
      reimSubmit: '/api/op/v1/reim/proc/start/:id', // 在列表中使用的差旅提交
    },
  },
  flowUpgrade: {
    getFlowList: '/api/flow/bpm/deploy/defs', // get 获取列表
    getFlow: '/api/flow/bpm/deploy/defs/xml', // get 获取工作流
    saveFlow: '/api/flow/bpm/deploy/defs', // post 保存工作流
    deleteFlow: '/api/flow/bpm/deploy/keys/:id', // 流程卸载(defKey) delete
    getBusConfig: '/api/flow/bpm/def/findBusinessDef/:defKey', // get 业务定义接口——单个查询
    saveBusConfig: '/api/flow/bpm/def/save', // post 保存业务配置
    getResolveField: '/api/flow/bpm/def/resolveField/:defKey', // get 获取业务字段
    getBusinessEvent: '/api/flow/bpm/def/businessEvent/:defKey', // get 获取业务事件
    saveEventInfo: '/api/flow/bpm/def/businessEvent/save', // POST 保存事件信息
    deleteEventInfo: '/api/flow/bpm/def/businessEvent/del/:ids', // PATCH 删除事件信息
    getEventInfo: '/api/flow/bpm/def/businessEvent/:id/find', // get 获取事件信息
    selectFlowRole: '/api/flow/bpm/def/businessTaskRole/:defKey/to/:taskKey/:id', // post 选择角色
    getLineVarInfo: '/api/flow/bpm/def/businessTaskBtn/:defKey/:taskKey', // 获取线配置变量说明
    getLineVarInfoNew: '/api/flow/bpm/def/businessTaskVariableTable/:defKey/:taskKey', // 获取线配置变量说明
    getFlowModel: '/api/flow/bpm/def/task/node/:defId', // 获取节点名称
    saveNodeConfig: '/api/flow/bpm/def/businessTaskBtn/:defKey/save', // 保存节点配置
    getLatestProcess: '/api/flow/bpm/def/process/latest/:defId', // 获取最新流程信息
    getBusinessBtn: '/api/flow/bpm/def/businessTaskBtn/:defKey/:taskKey', // 获取流程节点按钮组信息
    changeAutoAppr: '/api/flow/bpm/def/changeAutoAppr/:taskDefId/:autoAppr', // patch 修改节点的自动审批状态
  },
  flowHandle: {
    launchFlow: '/api/flow/bpm/process/definition/:processDefinitionKey/start-latest', // 提交流程 新流程提交
    pushFlow: '/api/flow/bpm/process/task/:taskId/complete/:result', // 提交或拒绝 无对应后端方法
    passAndReturn: '/api/flow/bpm/process/tasks/:id', // POST 流程通过或者退回 新流程审批
    reSubmissionRequest: '/api/flow/bpm/process/tasks/:taskId', // POST 退回流程提交 无后端方法
    addSign: '/api/flow/bpm/process/addSign', //  POST 加签
  },
  eval: {
    evald: '/api/base/v1/eval', // get post 评价， 拉模版，提交
    settleEval: '/api/base/v1/evalMas/settle', // get 拉取当量结算评价
    createEvalInfo: '/api/base/v1/eval/getCreateInfo', // g 初始化评价信息
    hasEval: '/api/base/v1/eval/hasEval', // g 是否评价过
    getEvaldHistory: '/api/base/v1/eval/evalList', // g 获取评价历史
    getEvalInfo: '/api/base/v1/eval/getInfo/:id', // g 获取评价详情
  },
  cservice: {
    omCalendarConfig: '/api/op/v1/operation/omCalendarConfig', // 获取运维日历循环事项列表
    omCalendarConfigById: '/api/op/v1/operation/omCalendarConfig/:id', // 获取运维日历循环事项详情
    calendarDetailCreate: '/api/op/v1/operation/omCalendarConfig', // 新增运维日历详情
    calendarDelete: '/api/op/v1/omCalendarConfig/del/:ids', // 删除运维日历详情
    vewCalendarList: '/api/op/v1/operation/omCalendarDetail/event/:id', // 根据ID获取运维明细行
    calendarListDetail: '/api/op/v1/operation/omCalendarDetail', // 新增运维日历明细
    calendarDeleteList: '/api/op/v1/omCalendarDetail/del/:ids', // 删除运维日历明细
    generateListDetail: '/api/op/v1/operation/omCalendar/task/:ids', // 点击按钮生成明细
    calendarListDetailById: '/api/op/v1/operation/omCalendarDetail/:id', // 根据id获取运维事项明细详情
    feedBackById: '/api/op/v1/operation/omCalendarDtAndFd/:id', // 根据id获取运维事项明细反馈
    feedBack: '/api/op/v1/operation/omCalendarFeedback', // 进行反馈
  },
  regularCare: {
    regularCareLists: '/api/op/v1/operation/omCustCareConfig', // 获取客户关怀列表
    omCareConfigById: '/api/op/v1/operation/omCustCareConfig/:id', // 获取客户关怀详情
    regularCareCreate: '/api/op/v1/operation/omCustCareConfig', // 新增客户关怀详情
    regularDelete: '/api/op/v1/omCustCareConfig/del/:ids', // 删除客户关怀详情
    vewRegularList: '/api/op/v1/operation/omCustCareDetail/event/:id', // 根据ID获取客户关怀明细行
    regularListDetail: '/api/op/v1/operation/omCustCareDetail', // 新增客户关怀明细
    regularDeleteList: '/api/op/v1/omCustCareDetail/del/:ids', // 删除客户关怀明细
    generateListDetail: '/api/op/v1/operation/omCustCare/task/:ids', // 点击按钮生成客户关怀明细
    regularListDetailById: '/api/op/v1/operation/omCustCareDetail/:id', // 根据id获取客户关怀明细详情
    regularFeedBackById: '/api/op/v1/operation/omCustCareDtAndFd/:id', // 根据id获取客户关怀明细反馈
    regularFeedBack: '/api/op/v1/operation/omCustCareFeedback', // 进行反馈
  },

  production: {
    common: {
      resSelectPagingUri: '/api/production/select/res', // 资源下拉
      ouSelectPagingUri: '/api/production/select/ou', // 公司下拉
      allOuSelectPagingUri: '/api/production/select/allOu', // 公司下拉
      buSelectPagingUri: '/api/production/select/bu', // bu下拉
      reportBuSelectPagingUri: '/api/production/select/report/bu', // bu下拉
      abSelectPagingUri: '/api/production/select/ab', // ab下拉
      contractSelectPagingUri: '/api/production/select/contract', // 合同下拉
      projectSelectPagingUri: '/api/production/select/project', // 项目下拉
      productSelectPagingUri: '/api/production/select/product', // 产品下拉
      businessAccItemPagingUri: '/api/production/select/businessAccItem', // 核算项目下拉

      // 系统模块下拉
      tenantSelectPagingUri: '/api/production/select/tenant', // 租户下拉

      udcSelect: '/eds/api/cds/udcs/:code/vals', // g/ 获取udc
      projectTemplate: '/api/production/select/projectTemplate', // g/ 项目模板下拉
      budgetSelectPagingUri: '/api/production/select/budget', // 预算下拉
      supplierSelectPagingUri: '/api/production/select/supplier', // 供应商下拉
      accountSelectPagingUri: '/api/production/select/account', // 账户下拉
      tripApplySelectPagingUri: '/api/production/select/tripApply', // 相关申请单下拉
      loanApplySelectPagingUri: '/api/production/select/loanApply', // 借申请相关申请单下拉
    },
    system: {
      // 系统选择项
      systemSelectionCreateUri: '/api/production/system_selection', // post
      systemSelectionModifyUri: '/api/production/system_selection', // put
      systemSelectionDetailUri: '/api/production/system_selection/:id', // get
      systemSelectionListPagingUri: '/api/production/system_selection/paging', // get
      systemSelectionLogicalDeleteUri: '/api/production/system_selection', // patch
      systemSelectionListByKeyUri: '/api/production/systemSelection/byKey/:key', // get
      systemSelectionContainBaseUri: '/api/production/systemSelection/containBase', // get 获取包含基础租户数据的选择项
      systemSelectionClearCacheUri: '/api/production/systemSelection/clearCache', // get
      systemSelectionCascaderUri: '/api/production/systemSelection/cascader', // get

      // 自定义选择项
      customSelectionCreateUri: '/api/production/customSelection', // post
      customSelectionModifyUri: '/api/production/customSelection/overall', // put
      customSelectionDetailUri: '/api/production/customSelection/:id', // get
      customSelectionListPagingUri: '/api/production/customSelection/paging', // get
      customSelectionLogicalDeleteUri: '/api/production/customSelection', // patch
      customSelectionListByKeyUri: '/api/production/customSelection/byKey/:key', // get
      customSelectionContainBaseUri: '/api/production/customSelection/containBase', // get 获取包含基础租户数据的选择项
      customSelectionClearCacheUri: '/api/production/customSelection/clearCache', // get
      customSelectionCascaderUri: '/api/production/customSelection/cascader', // get

      // 系统国际化
      systemLocalePortalUri: '/api/production/systemLocale/portal', // get
      systemLocaleCreateUri: '/api/production/systemLocale', // post
      systemLocaleModifyUri: '/api/production/systemLocale', // put
      systemLocaleDetailUri: '/api/production/systemLocale/:id', // get
      systemLocaleListPagingUri: '/api/production/systemLocale/paging', // get
      systemLocaleLogicalDeleteUri: '/api/production/systemLocale', // patch
      systemLocaleLogicalUploadUri: '/api/production/systemLocale/import/international', // post 上传csv
      systemLocaleClearCacheUri: '/api/production/systemRemind/clearCache', // get

      // 消息提醒
      systemRemindCreateUri: '/api/production/systemRemind', // post
      systemRemindOverallModifyUri: '/api/production/systemRemind/overall', // put
      systemRemindPartialModifyUri: '/api/production/systemRemind/partial', // put
      systemRemindDetailUri: '/api/production/systemRemind/:id', // get
      systemRemindListPagingUri: '/api/production/systemRemind/paging', // get
      systemRemindLogicalDeleteUri: '/api/production/systemRemind', // patch
      systemRemindClearCacheUri: '/api/production/systemRemind/clearCache', // get
      systemRemindPortalUri: '/api/production/systemRemind/portal', // get 前端消息提醒

      // 系统设置
      systemSettingCreate: '/api/production/systemSetting', // 新增系统设置
      systemSettingModify: '/api/production/systemSetting', // 修改系统设置
      systemSettingDetail: '/api/production/systemSetting/:id', // 查看系统设置详情
      systemSettingListPaging: '/api/production/systemSetting/paging', // 查询所有系统设置
      systemSettingLogicalDelete: '/api/production/systemSetting', // 删除系统设置
      systemSettingClearCacheUri: '/api/production/systemSetting/clearCache', // get
      systemSettingDetailByKeyUri: '/api/production/systemSetting/byKey/:key', // get

      // 用户自定义设置
      customSettingCreate: '/api/production/customSetting', // 新增用户自定义设置
      customSettingModify: '/api/production/customSetting', // 修改用户自定义设置
      customSettingDetail: '/api/production/customSetting/:id', // 查看用户自定义设置详情
      customSettingListPaging: '/api/production/customSetting/containBase', // 查询当前租户自定义设置
      customSettingLogicalDelete: '/api/production/customSetting', // 逻辑删除用户自定义设置
      customSettingClearCacheUri: '/api/production/customSetting/clearCache', // get
      customSettingDetailByKeyUri: '/api/production/customSetting/byKey/:key', // get
    },
    acc: {
      // 财务科目
      insertAccToU8c: '/api/production/accInfo/insertAccToU8c/:accCodes', //同步到用友
      financialAccSubjCreateUri: '/api/production/acc/financialAccSubj', // post
      financialAccSubjOverallModifyUri: '/api/production/acc/financialAccSubj/overall', // put
      financialAccSubjPartialModifyUri: '/api/production/acc/financialAccSubj/partial', // put
      financialAccSubjDetailUri: '/api/production/acc/financialAccSubj/:id', // get
      financialAccSubjListPagingUri: '/api/production/acc/financialAccSubj/paging', // get
      financialAccSubjLogicalDeleteUri: '/api/production/acc/financialAccSubj', // patch
      // 预算项目
      budgetItemCreateUri: '/api/production/acc/budgetItem', // post
      budgetItemOverallModifyUri: '/api/production/acc/budgetItem/overall', // put
      budgetItemPartialModifyUri: '/api/production/acc/budgetItem/partial', // put
      budgetItemDetailUri: '/api/production/acc/budgetItem/:id', // get
      budgetItemListPagingUri: '/api/production/acc/budgetItem/paging', // get
      budgetItemLogicalDeleteUri: '/api/production/acc/budgetItem', // patch
      // 核算项目
      businessAccItemCreateUri: '/api/production/acc/businessAccItem', // post
      businessAccItemOverallModifyUri: '/api/production/acc/businessAccItem/overall', // put
      businessAccItemPartialModifyUri: '/api/production/acc/businessAccItem/partial', // put
      businessAccItemDetailUri: '/api/production/acc/businessAccItem/:id', // get
      businessAccItemListPagingUri: '/api/production/acc/businessAccItem/paging', // get
      businessAccItemLogicalDeleteUri: '/api/production/acc/businessAccItem', // patch
      // 科目模板管理（产品化）
      subjectTemplateCreateUri: '/api/production/acc/subjectTemplate', // 新增科目模板管理
      subjectTemplateOverallModifyUri: '/api/production/acc/subjectTemplate/overall', // 全量修改用科目模板管理
      subjectTemplatePartialModifyUri: '/api/production/acc/subjectTemplate/partial', // 部分修改科目模板管理
      subjectTemplateDetailUri: '/api/production/acc/subjectTemplate/:id', // 查看科目模板管理详情
      subjectTemplateListPagingUri: '/api/production/acc/subjectTemplate/paging', // 科目模板管理列表
      subjectTemplateLogicalDeleteUri: '/api/production/acc/subjectTemplate', // 逻辑删除科目模板管理
      subjectTemplateBudgetTreeUri: '/api/production/acc/subjectTemplate/budgetTree/:id', // 科目模板预算树
    },
    bud: {
      // 预算
      budgetCreateUri: '/api/production/bud/budget', // post
      budgetOverallModifyUri: '/api/production/bud/budget/overall', // put
      budgetPartialModifyUri: '/api/production/bud/budget/partial', // put
      budgetDetailUri: '/api/production/bud/budget/:id', // get
      budgetListPagingUri: '/api/production/bud/budget/paging', // get
      budgetLogicalDeleteUri: '/api/production/bud/budget', // patch
      budgetOccupyInfoUri: '/api/production/bud/budget/budgetOccupyInfo', // get
      // 预算拨款
      budgetAppropriationCreateUri: '/api/production/bud/budgetAppropriation', // post
      budgetAppropriationOverallModifyUri: '/api/production/bud/budgetAppropriation/overall', // put
      budgetAppropriationPartialModifyUri: '/api/production/bud/budgetAppropriation/partial', // put
      budgetAppropriationDetailUri: '/api/production/bud/budgetAppropriation/:id', // get
      budgetAppropriationListPagingUri: '/api/production/bud/budgetAppropriation/paging', // get
      budgetAppropriationLogicalDeleteUri: '/api/production/bud/budgetAppropriation', // patch
      // 预算调整
      budgetAdjustSaveUri: '/api/production/bud/budget/adjust', // put
      budgetAdjustDetailUri: '/api/production/bud/budget/adjust/:id', // get
      budgetAdjustListPagingUri: '/api/production/bud/budget/adjust/paging', // get
    },
    pur: {
      // 采购
      purchaseCreateUri: '/api/production/pur/purchaseOrder', // post
      purchaseCheckUri: '/api/production/pur/purchaseOrder/adjust', // put
      purchaseDetailUri: '/api/production/pur/purchaseOrder/:id', // get
      purchaseOverallModifyUri: '/api/production/pur/purchaseOrder/overall', // put
      purchaseListPagingUri: '/api/production/pur/purchaseOrder/paging', // get
      purchaseLogicalDeleteUri: '/api/production/pur/purchaseOrder', // patch
      purchasePartialModifyUri: '/api/production/pur/purchaseOrder/partial', // put
      //付款计划
      paymentPlanListPagingUri: '/api/production/pur/paymentPlan/paging', // get
      findPaymentRequestIdByIdsUri: '/api/production/pur/paymentPlan/findPaymentRequestIdByIds', // get
      //付款申请
      paymentRequestListPagingUri: '/api/production/pur/paymentRequest/paging', // get
      paymentRequestCreateUri: '/api/production/pur/paymentRequest', // post
      paymentRequestDetailUri: '/api/production/pur/paymentRequest/:id', // get
      paymentRequestOverallModifyUri: '/api/production/pur/paymentRequest/overall/', // put
      paymentRequestModifyUri: '/api/production/pur/paymentRequest/partial', // put
      paymentCompleteUri: '/api/production/pur/paymentComplete', // put
      paymentRequestLogicalDeleteUri: '/api/production/pur/paymentRequest', // patch
      paymentRequestCompletePaymentUri: '/api/production/pur/paymentRequest/completePayment', // patch
    },
    // 出差申请
    trip: {
      // 出差申请保存+提交申请
      tripApplyCreateProcessUri: '/api/production/adm/tripApply/process', // post
      // 出差申请修改+提交申请
      tripApplyOverallModifyProcessUri: '/api/production/adm/tripApply/overall/process', // put
      // 出差申请
      tripApplyCreateUri: '/api/production/adm/tripApply', // post
      tripApplyDetailUri: '/api/production/adm/tripApply/:id', // get
      tripApplyOverallModifyUri: '/api/production/adm/tripApply/overall', // put
      tripApplyListPagingUri: '/api/production/adm/tripApply/paging',
      tripApplyMyTripListPagingUri: '/api/production/adm/myTripApply/paging',
      tripApplyLogicalDeleteUri: '/api/production/adm/tripApply', // patch
      tripApplyPartialModifyUri: '/api/production/adm/tripApply/partial', // put
      // 出差费用明细
      tripExpenseDetailCreateUri: '/api/production/adm/tripExpenseDetail', // post
      tripExpenseDetailDetailUri: '/api/production/adm/tripExpenseDetail/:id', // get
      tripExpenseDetailOverallModifyUri: '/api/production/adm/tripExpenseDetail/overall', // put
      tripExpenseDetailListPagingUri: '/api/production/adm/tripExpenseDetail/paging',
      tripExpenseDetailListAllDataUri: '/api/production/adm/tripExpenseDetail/all',
      tripExpenseDetailLogicalDeleteUri: '/api/production/adm/tripExpenseDetail', // patch
      tripExpenseDetailPartialModifyUri: '/api/production/adm/tripExpenseDetail/partial', // put
      tripExpenseDetailMyTripListPagingUri:
        '/api/production/adm/tripManagement/tripTicket/detail/findDetailList', //get
      othersTripExpenseDataUri:
        '/api/production/adm/tripManagement/tripTicket/detail/findOtherDetailList', //post
      //行政订票
      tripManagementCreateUri: '/api/production/adm/tripTicketBook', //post
      tripManagementDetailUri: '/api/production/adm/tripTicketBook/findByKey/:id', // get
      tripManagementOverallModifyUri: '/api/production/adm/tripTicketBook/overallUpdate', // put
      tripManagementPersonUri: '/api/production/adm/tripTicketBook/:id', // get
      tripManagementModifyUri: '/api/production/adm/tripTicketBook/partial', // put
      getAllBookingDetailUri: '/api/production/adm/tripTicketBook/getAllBookingDetail/:ids', // patch 新加流程配置 删除
      //行政订票结算
      tripManagementClaimCreateUri: '/api/production/adm/tripTicketClaim', //post
      tripManagementClaimOverallModifyUri: '/api/production/adm/tripTicketClaim/overall', // put
      tripManagementClaimDetailUri: '/api/production/adm/tripTicketClaim/:id', // get
      tripManagementClaimListPagingUri: '/api/production/adm/tripTicketClaim/paging', //get
      tripManagementClaimLogicalDelete: '/api/production/adm/tripTicketClaim', // patch
      // /api/production/adm/tripTicketClaim/overall
    },
    //行政管理模块
    adm: {
      // 版权管理
      copyrightCreateUri: '/api/production/adm/copyright', // post
      copyrightPgingUri: '/api/production/adm/copyright/paging', // 周报列表 - get
      copyrightOverallUri: '/api/production/adm/copyright/overall', // 整体更新 - put
      copyrightDeleteUri: '/api/production/adm/copyright', // 删除 - patch
      copyrightDetailUri: '/api/production/adm/copyright/:id', // 详情 - get
    },
    // 费用
    cos: {
      // 常规报销
      expenseClaimCreateUri: '/api/production/cos/expenseClaim', // post
      expenseClaimOverallModifyUri: '/api/production/cos/expenseClaim/overall', // put
      expenseClaimPartialModifyUri: '/api/production/cos/expenseClaim/partial', // put
      expenseClaimDetailUri: '/api/production/cos/expenseClaim/:id', // get
      expenseClaimListPagingUri: '/api/production/cos/expenseClaim/paging', // get
      expenseClaimLogicalDeleteUri: '/api/production/cos/expenseClaim', // patch
      expenseClaimFinishPayUri: '/api/production/cos/expenseClaim/finishPay', // put
      // 借款申请
      loanApplyCreateUri: '/api/production/cos/loan', // post
      loanApplyOverallModifyUri: '/api/production/cos/loan/overall', // put
      loanApplyPartialModifyUri: '/api/production/cos/loan/partial', // put
      loanApplyDetailUri: '/api/production/cos/loan/:id', // get
      loanApplyListPagingUri: '/api/production/cos/loan/paging', // get
      loanApplyLogicalDeleteUri: '/api/production/cos/loan', // patch

      // 借款申请
      otherPaymentCreateUri: '/api/production/cos/otherPayment', // post
      otherPaymentOverallModifyUri: '/api/production/cos/otherPayment/overall', // put
      otherPaymentPartialModifyUri: '/api/production/cos/otherPayment/partial', // put
      otherPaymentDetailUri: '/api/production/cos/otherPayment/:id', // get
      otherPaymentListPagingUri: '/api/production/cos/otherPayment/paging', // get
      otherPaymentLogicalDeleteUri: '/api/production/cos/otherPayment', // patch
    },
    sale: {
      // 销售单管理
      saleOrderPging: '/api/production/sale/salesOrder/paging', // 周报列表 - get
      saleOrderIncrease: '/api/production/sale/saleOrder', // 周报新增 - post
      saleOrderOverall: '/api/production/sale/saleOrder/overall', // 整体更新 - put
      saleOrderPartial: '/api/production/sale/salesOrder/partial', // 指定更新 - put
      saleOrderDelete: '/api/production/sale/salesOrder/:ids', // 删除 - patch
      saleOrderDetail: '/api/production/sale/salesOrder/:id', // 详情 - get
      saleOrderAdjustDetail: '/api/production/sale/salesOrderAdjust/:id', // 详情 - get
      saleOrderAdjust: '/api/production/sale/saleOrder/adjust', //销售调整
    },
    collectionPlan: {
      // 收款计划
      collectionPlanPging: '/api/production/collectionPlan/paging', // 列表 - get
      collectionPlanIncrease: '/api/production/collectionPlan/save', // 新增 - post
      collectionPlanOverall: '/api/production/collectionPlan/overall', // 整体更新 - put
      collectionPlanPartial: '/api/production/collectionPlan/partial', // 指定更新 - put
      collectionPlanDelete: '/api/production/collectionPlan/logicalDelete/:ids', // 删除 - patch
      collectionPlanDetail: '/api/production/collectionPlan/findById/:id', // 详情 - get
      salesInvoiceApplySave: '/api/production/salesInvoiceApply/save', // 开票申请保存+提交 - post
      saveCollectionData: '/api/production/collectionPlan/saveCollectionData', // 收款录入保存 - post
      getBankInfo: '/api/production/salSelection/getBankInfo/:id', // 相关申请单下拉
      getCollectionDetailById: '/api/production/collectionPlan/getCollectionDetailById/:id', // 根据收款计划查收款明细 - get
    },
    salesInvoice: {
      salesInvoiceApplyPging: '/api/production/salesInvoiceApply/paging', // 列表 - get
      salesInvoiceApplyOverall: '/api/production/salesInvoiceApply/overall', // 整体更新 - put
      salesInvoiceApplyPartial: '/api/production/salesInvoiceApply/partial', // 指定更新 - put
      salesInvoiceApplyDelete: '/api/production/salesInvoiceApply/logicalDelete/:ids', // 删除 - patch
      salesInvoiceApplyDetail: '/api/production/salesInvoiceApply/findById/:id', // 详情 - get
      salesInvoiceApplySave: '/api/production/salesInvoiceApply/save', // 保存+提交 - get
    },
    res: {
      //工资单管理
      payRollPaging: '/api/production/payroll/paging', //工资单列表  get
      payRollDetail: '/api/production/payroll/:id', //工资单详情  get
      payRollDelete: '/api/production/payroll/:ids', //删除-patch
      payrollImport: '/api/production/payroll/importExcel', //导入工资单  post
      myPayRollPaging: '/api/production/payroll/findByUserId', //我的工资单列表 get

      //休假
      vacation: {
        vacationMgmt: '/api/production/vacation', // 假期管理list，新增，修改
        vacationDetail: '/api/production/vacation/:id', // 假期详情
        vacationMgmtDelete: '/api/production/vacation/:ids', // 假期管理删除
        vacationApply: '/api/production/vacationApply', // 假期申请list、新增，修改
        vacationApplyDetail: '/api/production/vacationApply/:id', // 假期申请详情
        vacationUpload: '/api/production/vacation/upload', // 导入假期excel文件
        vacationBuList: '/api/production/vacation/ByBu', // 我的BU假期列表
        queryTemporaryTimeUri: '/api/production/vacationSettings', // 参数配置弹窗查询出有效期
        saveTemporaryTimeUri: '/api/production/vacationSettings', // 参数配置弹窗保存有效期
        batchSaveTemporaryTimeUri: '/api/production/vacationUpdate/:ids', // 批量修改有效期
      },

      myVacation: {
        vacationApply: '/api/production/vacationApply', // 休假申请列表、新增、更新
        vacationResDetail: '/api/production/vacationApply/resInfo/:resId', // 我的休假详情
        vacationFlowDetail: '/api/production/vacationApply/:id', // 休假流程详情
      },
    },
    user: {
      //员工信息
      informationListPagingUri: '/api/production/user/information/paging', // get
      openAccountUri: '/api/production/user/information/openAccount', // get
      modifyInformationUri: '/api/production/user/information/modifyInformation', // put
      informationImport: '/api/production/user/information/importExcel', //excel导入  post
      informationDetailUri: '/api/production/user/information/:id', // get
      //我的借款
      loanListPagingUri: '/api/production/cos/loan/paging', // get
      exportEmployee: '/api/production/user/information/payExport', // post 员工信息导出所选字段
      templateList: '/api/production/user/information/getUserExportTemp', // get 获取模板
      transactionSub: '/api/production/user/information/changeInformation', // put 员工异动提交
      changeList: '/api/production/user/information/changeList', // get 获取异动记录
      informationFlowDetailUri: '/api/production/user/userInformationChange/:id', // get 员工异动流程详情
      informationAssSubUri: '/api/production/userProbationPeriod/insert', // post 试用期考核提交
      informationAssOverAllUri: '/api/production/userProbationPeriod/overall', // post 试用期考核提交
      informationAssFlowDetail: '/api/production/userProbationPeriod/findByKey/:id', // get 试用期考核流程
      informationLeaveApply: '/api/production/userLeaveApply/insert', // post 离职申请
      informationLeaveOverAllUri: '/api/production/userLeaveApply/overall', // 离职流程
      informationLeaveFlowDetail: '/api/production/userLeaveApply/findByKey/:id', // get 试用期考核流程
    },
    //用友同步接口
    inter: {
      // 把新增的部门数据同步到用友
      insertDeptToU8cUri: '/api/production/bu/insertDeptToU8c/:buNos', // post
      // 把新增的客商数据同步到用友
      insertCustSupplierToU8cUri: '/api/production/ab/insertCustSupplierToU8c/:abNos', // post
      // 把新增的人员数据同步到用友
      insertPsnToU8cUri: '/api/production/psn/insertPsnToU8c/:resNos', // post
      // 把新增的科目数据同步到用友
      insertAccToU8cUri: '/api/production/accInfo/insertAccToU8c/:accCodes', // post
    },
    interface: {
      //应收
      insertWillCollectionToU8c: '/api/production/willCollection/insertWillCollectionToU8c/:ids', // 新增的应收数据同步到用友 - post
      willCollectionSave: '/api/production/willCollection/save', // 新增 - post
      // willCollectionOverall: '/api/production/willCollection/overall', // 整体更新 - put
      // willCollectionPartial: '/api/production/willCollection/partial', // 指定更新 - put
      willCollectionDelete: '/api/production/willCollection/logicalDelete/:ids', // 删除 - patch
      willCollectionDetail: '/api/production/willCollection/findById/:id', // 详情 - get
      willCollectionPaging: '/api/production/willCollection/paging', // 列表 - get

      //应付
      insertWillPayToU8c: '/api/production/willPay/insertWillPayToU8c/:ids', //新增的应收数据同步到用友 - post
      willPaySave: '/api/production/willPay/save', // 新增 - post
      // willPayOverall: '/api/production/willPay/overall', // 整体更新 - put
      // willPayPartial: '/api/production/willPay/partial', // 指定更新 - put
      willPayDelete: '/api/production/willPay/logicalDelete/:ids', // 删除 - patch
      willPayDetail: '/api/production/willPay/findById/:id', // 详情 - get
      willPayPaging: '/api/production/willPay/paging', // 列表 - get

      //付款
      insertPayToU8c: '/api/production/pay/insertPayToU8c/:ids', // 把新增的数据同步到用友  - post
      paySave: '/api/production/pay/save', // 新增 - post
      // payOverall: '/api/production/pay/overall', // 整体更新 - put
      // payPartial: '/api/production/pay/partial', // 指定更新 - put
      payDelete: '/api/production/pay/logicalDelete/:ids', // 删除 - patch
      payDetail: '/api/production/pay/findById/:id', // 详情 - get
      payPaging: '/api/production/pay/paging', // 列表 - get

      //收款
      insertCollectionToU8c: '/api/production/collection/insertCollectionToU8c/:ids', // 把新增的收款单数据同步到用友  - post
      collectionSave: '/api/production/collection/save', // 新增 - post
      // collectionOverall: '/api/production/collection/overall', // 整体更新 - put
      // collectionPartial: '/api/production/collection/partial', // 指定更新 - put
      collectionDelete: '/api/production/collection/logicalDelete/:ids', // 删除 - patch
      collectionDetail: '/api/production/collection/findById/:id', // 详情 - get
      collectionPaging: '/api/production/collection/paging', // 列表 - get
    },
    report: {
      projectReportPagingUri: '/api/production/report/projectReport/paging', // get
      productReportPagingUri: '/api/production/report/productReport/paging', // get
      departmentReportPagingUri: '/api/production/report/departmentReport/paging', // get
      specialReportPagingUri: '/api/production/report/specialProjectReport/paging', // get
    },
  },

  // 工作台
  workbench: {
    contract: {
      // =====================合同管理=====================
      pcontractSave: '/api/production/adm/v1/pcontract/save', // 合同管理-保存接口 post
      pcontractSubmit: '/api/production/adm/v1/pcontract/submit', // 合同管理-提交接口post
      pcontractOverall: '/api/production/adm/v1/pcontract/overall', // 合同管理-整体更新接口 PUT
      pcontractPartial: '/api/production/adm/v1/pcontract/partial', // 合同管理-指定更新接口 PUT
      pcontractDelete: '/api/production/adm/v1/pcontract/:ids', // 合同管理-删除接口 PATCH
      pcontractChangeStatus: '/api/production/adm/v1/pcontract/:ids/:contractStatus', // 合同管理-激活关闭接口 PUT
      pcontractDetail: '/api/production/adm/v1/pcontract/:id', // 合同管理-详情接口 GET
      pcontractPaging: '/api/production/adm/v1/pcontract/paging', // 合同管理-列表查询接口 GET
      pcontractRelatedDocs: '/api/production/adm/v1/pcontract/relatedDocs', // 合同管理-相关单据查询接口 GET

      // =====================规则模板管理==========================
      rulesTemplateSave: '/api/production/com/v1/rulesTemplate', // 规则模版管理-新增接口
      rulesTemplateOverall: '/api/production/com/v1/rulesTemplate/overall', // 规则模版管理-整体更新接口
      rulesTemplateDelete: '/api/production/com/v1/rulesTemplate/:ids', // 规则模版管理-删除接口
      rulesTemplatePaging: '/api/production/com/v1/rulesTemplate/paging', // 规则模版管理-列表查询接口
      rulesTemplateDetail: '/api/production/com/v1/rulesTemplate/:id', // 规则模版管理-详情接口
      rulesTemplateChangeDisable:
        '/api/production/com/v1/rulesTemplate/changeDisable/:ids/:isDisabled', // 规则模板-有效变无效
      rulesTemplateRulesDetail:
        '/api/production/com/v1/rulesTemplateDetail/:associatedObject/:associatedObjectClass1/:associatedObjectClass2', // 规则模版管理-根据合同分类对象、合同分类对象1、合同分类对象2查询规则明细
    },
    project: {
      // ======================产品列表管理=================
      productManagementSave: '/api/production/pro/productManagement', // 新增 - post
      productManagementOverall: '/api/production/pro/productManagement/overall', // 修改 - put
      productManagementPartial: '/api/production/pro/productManagement/partial', // 状态更新 - put
      productManagementDelete: '/api/production/pro/productManagement/:ids', // 删除 - patch
      productManagementDetail: '/api/production/pro/productManagement/:id', // 删除 - get
      productManagementaPging: '/api/production/pro/productManagement/paging', // 列表 - get
      expenseQuotaFindQuotasUri: '/api/production/cos/expenseQuota/findQuotas', // 获取报销额度
      noticeResIdByDailyId: '/api/production/projectDaily/getNoticeResIdByDailyId/:id', // 根据日报id计算通告单提交时出示通知人员
      // ======================项目列表管理=================
      projectManagementSave: '/api/production/pro/projectManagement', // 新增 - post
      projectManagementOverall: '/api/production/pro/projectManagement/overall', // 修改 - put
      projectManagementPartial: '/api/production/pro/projectManagement/partial', // 状态更新 - put
      projectManagementDelete: '/api/production/pro/projectManagement/:ids', // 删除 - patch
      projectManagementDetail: '/api/production/pro/projectManagement/:id', // 详情 - get
      projectManagementPging: '/api/production/pro/projectManagement/paging', // 列表 - get

      // ======================项目成员管理=================
      projectMemberPage: '/api/production/pro/projectMember/paging', // 列表 - get
      projectMemberSave: '/api/production/pro/projectMember', // 新增 - post
      projectMemberOverall: '/api/production/pro/projectMember/overall', // 修改 - put
      projectMemberDetail: '/api/production/pro/projectMember/:id', // 详情 - get
      projectMemberDelete: '/api/production/pro/projectMember/:ids', // 删除 - patch

      // 报销管理 - 报销额度管理
      expenseQuotaPaging: '/api/production/cos/expenseQuota/paging', // 列表 - get
      expenseQuotaSave: '/api/production/cos/expenseQuota', // 新增 - post
      expenseQuotaOverall: '/api/production/cos/expenseQuota/overall', // 修改 - put
      expenseQuotaPartial: '/api/production/cos/expenseQuota/partial', // 指定更新 - put
      expenseQuotaDetail: '/api/production/cos/expenseQuota/:id', // 详情 - get
      expenseQuotaDelete: '/api/production/cos/expenseQuota/:ids', // 删除 - patch
      // 明细
      expenseQuotaDSave: '/api/production/cos/expenseQuotaD', // 明细新增接口 - post
      expenseQuotaDOverall: '/api/production/cos/expenseQuotaD/overall', // 明细整体更新接口 - put
      expenseQuotaDDelete: '/api/production/cos/expenseQuotaD/:ids', // 明细删除接口 - patch
      expenseQuotaDDetail: '/api/production/cos/expenseQuotaD/:id', // 明细详情接口 - get

      relatedDimensions: '/api/production/cos/expenseQuota/relatedDimensions/:id', // 报销额度管理-相关维度查询接口 - get

      // 项目计划
      projectPlanIncrease: '/api/production/pro/wbs/plan', // 新增 - post
      projectPlanOverall: '/api/production/pro/wbs/plan/overall', // 整体更新 - put
      projectPlanPartial: '/api/production/pro/wbs/plan/partial', // 指定更新 - put
      projectPlanDelete: '/api/production/pro/wbs/plan/:ids', // 删除 - patch
      projectPlanDetail: '/api/production/pro/wbs/plan/:id', // 详情 - get
      projectPlanList: '/api/production/pro/wbs/plan/paging', // 列表 - get
      planMember: '/api/production/pro/wbs/planMember', //计划相关成员 - get
      excelImport: '/api/production/pro/wbs/excelImport', //excel导入 - post

      // 项目阶段
      projectPhaseIncrease: '/api/production/pro/wbs/phase', // 新增 - post
      projectPhaseOverall: '/api/production/pro/wbs/phase/overall', // 整体更新 - put
      projectPhasePartial: '/api/production/pro/wbs/phase/partial', // 指定更新 - put
      projectPhaseDelete: '/api/production/pro/wbs/phase/:ids', // 删除 - patch
      projectPhaseDetail: '/api/production/pro/wbs/phase/:id', // 详情 - get

      projectPhaseList: '/api/production/projectPhase/paging', // 列表 - get

      // WBS详情查询
      wbsTree: '/api/production/pro/wbs/tree', // 列表 - get

      // 项目进度管理
      dailyPaging: '/api/production/pro/projectProgress/daily/paging', // 列表 - get
      dailyIncrease: '/api/production/pro/projectProgress/daily', // 新增 - post
      dailyOverall: '/api/production/pro/projectProgress/daily/overall', // 整体更新 - put
      dailyPartiall: '/api/production/pro/projectProgress/daily/partiall', // 指定更新 - put
      dailyDelete: '/api/production/pro/projectProgress/daily/:ids', // 删除 - patch
      dailyDetail: '/api/production/pro/projectProgress/daily/:id', // 详情 - get
      dailyPlanDetail: '/api/production/pro/projectProgress/dailyPlan/:id', // 日计划详情 - get
      dailyReportDetail: '/api/production/pro/projectProgress/dailyReport/:id', // 日报详情 - get

      progressUpdate: '/api/production/pro/projectProgress/progressUpdate', // 进度更新 - put

      // 项目周报
      weeklyPging: '/api/production/pro/weeklyReport/paging', // 周报列表 - get
      weeklyIncrease: '/api/production/pro/weeklyReport', // 周报新增 - post
      weeklyOverall: '/api/production/por/weeklyReport/overall', // 整体更新 - put
      weeklyPartial: '/api/production/pro/weeklyReport/partial', // 指定更新 - put
      weeklyDelete: '/api/production/pro/weeklyReport/:ids', // 删除 - patch
      weeklyDetail: '/api/production/pro/weeklyReport/paging/:id', // 详情 - get
      weeklyDailyDetail:
        '/api/production/pro/weeklyReport/daily/:projectId/:reportDateFrom/:reportDateTo', // 项目详情信息 - get

      // 项目概览
      projectOverview: '/api/production/pro/project/overview/:id', // 详情 - get

      // 项目风险管理
      projectRiskPaging: '/api/production/pro/projectRisk/paging', // 列表 - get
      projectRiskIncrease: '/api/production/pro/projectRisk', // 新增 - post
      projectRiskOverall: '/api/production/pro/projectRisk/overall', // 整体更新 - put
      projectRiskPartial: '/api/production/pro/projectRisk/partial', // 指定更新 - put
      projectRiskDelete: '/api/production/pro/projectRisk/:ids', // 删除 - patch
      projectRiskDetail: '/api/production/pro/projectRisk/:id', // 详情 - get

      //项目模板管理
      projectTemplatePaging: '/api/production/pro/projectTemplate/paging', //列表 - get
      projectTemplateIncrease: '/api/production/pro/projectTemplate', // 新增 - post
      projectTemplatePartial: '/api/production/pro/projectTemplate/partial', // 指定更新 - put
      projectTemplateOverall: '/api/production/pro/projectTemplate/overall', // 整体更新 - put
      projectTemplateDelete: '/api/production/pro/projectTemplate/:ids', // 删除 - patch
      projectTemplateDetail: '/api/production/projectTemplate/:id', // 详情 - get

      //成员模板管理
      peopTemplatePaging: '/api/production/pro/projectTemplatemenbers/paging', //列表 - get
      peopTemplateIncrease: '/api/production/pro/projectTemplatemenbers', // 新增 - post
      peopTemplatePartial: '/api/production/projectTemplateMember/partial', // 指定更新 - put
      peopTemplateOverall: '/api/production/pro/projectTemplatemenbers/overall', // 整体更新 - put
      peopTemplateDelete: '/api/production/pro/projectTemplatemenbers/:ids', // 删除 - patch
      peopTemplateDetail: '/api/production/pro/projectTemplate/:id', // 详情 - get

      //wbs列表
      WBSTemplatePaging: '/api/production/pro/projectTemplatewbs/paging', //列表 - get

      templatePhasePaging: '/api/production/pro/projectTemplatephase/paging', //项目阶段列表 get
      templatePhaseIncrease: '/api/production/pro/projectTemplatephase', //项目阶段新增   post
      templatePhasePartial: '/api/production/projectTemplatePhase/partial', // 指定更新 - put
      templatePhaseOverall: '/api/production/pro/projectTemplate/Phase/overall', // 整体更新 - put
      templatePhaseDelete: '/api/production/pro/projectTemplate/Phase/:ids', // 删除 - patch
      templatePhaseDetail: '/api/production/pro/projectTemplate/Phase/:id', //项目阶段详情  get

      templatePlanPaging: '/api/production/pro/projectTemplateplan/paging', //项目计划列表 get
      templatePlanIncrease: '/api/production/pro/projectTemplateplan', //项目计划新增   post
      templatePlanPartial: '/api/production/projectTemplatePhase/plan', // 指定更新 - put
      templatePlanOverall: '/api/production/pro/projectTemplate/Plan/overall', // 整体更新 - put
      templatePlanDelete: '/api/production/pro/projectTemplate/Plan/:ids', // 删除 - patch
      templatePlanDetail: '/api/production/pro/projectTemplate/Plan/:id', //项目阶段详情  get
    },
  },
};
