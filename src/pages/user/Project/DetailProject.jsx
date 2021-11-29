import React, { PureComponent } from 'react';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Card, Divider } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import { getParam, editParam, addParam } from '@/utils/urlUtils';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import { FileManagerEnhance } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import Loading from '@/components/core/DataLoading';

const { Description } = DescriptionList;

const DOMAIN = 'userProjectQuery';

@connect(({ loading, userProjectQuery, dispatch }) => ({
  loading,
  userProjectQuery,
  dispatch,
}))
class ProjectDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PROJECT_MANAGEMENT_PROJECT_SAVE' },
    });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    });
    dispatch({ type: `${DOMAIN}/projectProfitReport` });
    dispatch({ type: `${DOMAIN}/projExecutionInfo` });
  }

  renderPage = () => {
    const {
      loading,
      dispatch,
      userProjectQuery: {
        formData,
        dataSource,
        reportBtn,
        jumpData,
        reportBtnProjExecution,
        jumpDataProjExecution,
        pageConfig,
      },
    } = this.props;
    const param = fromQs();
    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentProjrctConfig = [];
    let currentReportConfig = [];
    let currentContractConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.tableName === 'T_PROJECT') {
        currentProjrctConfig = view;
      } else if (view.tableName === 'T_PROJ_REPORT_PLAN') {
        currentReportConfig = view;
      } else if (view.tableName === 'T_CONTRACT') {
        currentContractConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsProject } = currentProjrctConfig; // 项目表
    const { pageFieldViews: pageFieldViewsReport } = currentReportConfig; // 项目汇报表
    const { pageFieldViews: pageFieldViewsContract } = currentContractConfig; // 合同表

    const pageFieldJsonProject = {}; // 项目表
    const pageFieldJsonReport = {}; // 项目汇报表
    const pageFieldJsonContract = {}; // 合同表
    if (pageFieldViewsProject) {
      pageFieldViewsProject.forEach(field => {
        pageFieldJsonProject[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsReport) {
      pageFieldViewsReport.forEach(field => {
        pageFieldJsonReport[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsContract) {
      pageFieldViewsContract.forEach(field => {
        pageFieldJsonContract[field.fieldKey] = field;
      });
    }
    const basicFields = [
      <Description
        term={pageFieldJsonProject.projName.displayName}
        key="projName"
        sortNo={pageFieldJsonProject.projName.sortNo}
      >
        {formData.projName}
      </Description>,
      <Description
        term={pageFieldJsonProject.projNo.displayName}
        key="projNo"
        sortNo={pageFieldJsonProject.projNo.sortNo}
      >
        {formData.projNo}
      </Description>,
      <Description
        term={pageFieldJsonProject.custIdst.displayName}
        key="custIdst"
        sortNo={pageFieldJsonProject.custIdst.sortNo}
      >
        {formData.custIdstDesc}
      </Description>,
      <Description
        term={pageFieldJsonProject.custRegion.displayName}
        key="custRegion"
        sortNo={pageFieldJsonProject.custRegion.sortNo}
      >
        {formData.custRegionDesc}
      </Description>,
      <Description
        term={pageFieldJsonContract.deliveryAddress.displayName}
        key="deliveryAddress"
        sortNo={pageFieldJsonContract.deliveryAddress.sortNo}
      >
        {formData.deliveryAddress}
      </Description>,
      <Description
        term={pageFieldJsonContract.ouId.displayName}
        key="ouId"
        sortNo={pageFieldJsonContract.ouId.sortNo}
      >
        {formData.ouName}
      </Description>,
      <Description
        term={pageFieldJsonContract.workType.displayName}
        key="workType"
        sortNo={pageFieldJsonContract.workType.sortNo}
      >
        {formData.workTypeDesc}
      </Description>,
      <Description
        term={pageFieldJsonProject.projTempId.displayName}
        key="projTempId"
        sortNo={pageFieldJsonProject.projTempId.sortNo}
      >
        {formData.projTempName}
      </Description>,
      <Description
        term={pageFieldJsonProject.planStartDate.displayName}
        key="planStartDate"
        sortNo={pageFieldJsonProject.planStartDate.sortNo}
      >
        {formData.planStartDate}
      </Description>,
      <Description
        term={pageFieldJsonProject.planEndDate.displayName}
        key="planEndDate"
        sortNo={pageFieldJsonProject.planEndDate.sortNo}
      >
        {formData.planEndDate}
      </Description>,
      <Description
        term={pageFieldJsonContract.custpaytravelFlag.displayName}
        key="custpaytravelFlag"
        sortNo={pageFieldJsonContract.custpaytravelFlag.sortNo}
      >
        {formData.custpaytravelFlagDesc || ''}
      </Description>,
      <Description term="SOW节选">
        <FileManagerEnhance
          api="/api/op/v1/project/sow/sfs/token"
          dataKey={param.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description
        term={pageFieldJsonProject.maxTravelFee.displayName}
        key="maxTravelFee"
        sortNo={pageFieldJsonProject.maxTravelFee.sortNo}
      >
        {formData.maxTravelFee}
        /天
      </Description>,
      <Description
        term={pageFieldJsonContract.currCode.displayName}
        key="currCode"
        sortNo={pageFieldJsonContract.currCode.sortNo}
      >
        {formData.currCodeDesc}
      </Description>,
      <DescriptionList
        size="large"
        col={1}
        key="remark"
        sortNo={pageFieldJsonProject.remark.sortNo}
      >
        <Description term={pageFieldJsonProject.remark.displayName}>
          <pre>{formData.remark}</pre>
        </Description>
      </DescriptionList>,
      <Description
        term={pageFieldJsonProject.projStatus.displayName}
        key="projStatus"
        sortNo={pageFieldJsonProject.projStatus.sortNo}
      >
        {formData.projStatusName}
      </Description>,
      <Description
        term={pageFieldJsonProject.createUserId.displayName}
        key="createUserId"
        sortNo={pageFieldJsonProject.createUserId.sortNo}
      >
        {formData.createUserName}
      </Description>,
      <Description
        term={pageFieldJsonProject.createTime.displayName}
        key="createTime"
        sortNo={pageFieldJsonProject.createTime.sortNo}
      >
        {formData.createTime}
      </Description>,
    ];
    const filterList1 = basicFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const releateFields = [
      <Description
        term={pageFieldJsonContract.deliBuId.displayName}
        key="deliBuId"
        sortNo={pageFieldJsonContract.deliBuId.sortNo}
      >
        {formData.deliBuName}
      </Description>,
      <Description
        term={pageFieldJsonContract.deliResId.displayName}
        key="deliResId"
        sortNo={pageFieldJsonContract.deliResId.sortNo}
      >
        {formData.deliResName}
      </Description>,
      <Description
        term={pageFieldJsonProject.projectDifficult.displayName}
        key="projectDifficult"
        sortNo={pageFieldJsonProject.projectDifficult.sortNo}
      >
        {formData.projectDifficultName}
      </Description>,
      <Description
        term={pageFieldJsonProject.projectImportance.displayName}
        key="projectImportance"
        sortNo={pageFieldJsonProject.projectImportance.sortNo}
      >
        {formData.projectImportanceName}
      </Description>,
      <Description
        term={pageFieldJsonProject.pmResId.displayName}
        key="pmResId"
        sortNo={pageFieldJsonProject.pmResId.sortNo}
      >
        {formData.pmResName}
      </Description>,
      <Description
        term={pageFieldJsonProject.pmEqvaRatio.displayName}
        key="pmEqvaRatio"
        sortNo={pageFieldJsonProject.pmEqvaRatio.sortNo}
      >
        {formData.pmEqvaRatio}
      </Description>,
      <Description
        term={pageFieldJsonContract.salesmanResId.displayName}
        key="salesmanResId"
        sortNo={pageFieldJsonContract.salesmanResId.sortNo}
      >
        {formData.salesmanResName}
      </Description>,
      <Description
        term={pageFieldJsonProject.pmoResId.displayName}
        key="pmoResId"
        sortNo={pageFieldJsonProject.pmoResId.sortNo}
      >
        {formData.pmoResIdName}
      </Description>,
    ];
    const filterList2 = releateFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const budgetFields = [
      <Description
        term={pageFieldJsonProject.totalDays.displayName}
        key="totalDays"
        sortNo={pageFieldJsonProject.totalDays.sortNo}
      >
        {formData.totalDays}
      </Description>,
      <Description
        term={pageFieldJsonProject.totalEqva.displayName}
        key="totalEqva"
        sortNo={pageFieldJsonProject.totalEqva.sortNo}
      >
        {formData.totalEqva}
      </Description>,
      <Description
        term={pageFieldJsonProject.eqvaPrice.displayName}
        key="eqvaPrice"
        sortNo={pageFieldJsonProject.eqvaPrice.sortNo}
      >
        {formData.eqvaPrice}/{formData.eqvaPriceTotal}
      </Description>,
      <Description
        term={pageFieldJsonProject.totalReimbursement.displayName}
        key="totalReimbursement"
        sortNo={pageFieldJsonProject.totalReimbursement.sortNo}
      >
        {formData.totalReimbursement}
      </Description>,
      <Description term="预算附件">
        <FileManagerEnhance
          api="/api/op/v1/project/budget/sfs/token"
          dataKey={param.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description
        term={pageFieldJsonProject.totalCost.displayName}
        key="totalCost"
        sortNo={pageFieldJsonProject.totalCost.sortNo}
      >
        {formData.totalCost}
      </Description>,
    ];
    const filterList3 = budgetFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const authorizationFields = [
      <Description
        term={pageFieldJsonProject.epibolyPermitFlag.displayName}
        key="epibolyPermitFlag"
        sortNo={pageFieldJsonProject.epibolyPermitFlag.sortNo}
      >
        {formData.epibolyPermitFlag === 1
          ? '是'
          : (formData.epibolyPermitFlag === 0 ? '否' : '') || ''}
      </Description>,
      <Description
        term={pageFieldJsonProject.subcontractPermitFlag.displayName}
        key="subcontractPermitFlag"
        sortNo={pageFieldJsonProject.subcontractPermitFlag.sortNo}
      >
        {formData.subcontractPermitFlag === 1
          ? '是'
          : (formData.subcontractPermitFlag === 0 ? '否' : '') || ''}
      </Description>,
      <Description
        term={pageFieldJsonProject.timesheetPeriod.displayName}
        key="timesheetPeriod"
        sortNo={pageFieldJsonProject.timesheetPeriod.sortNo}
      >
        {formData.timesheetPeriodDesc}
      </Description>,
      <Description
        term={pageFieldJsonProject.finishApproveFlag.displayName}
        key="finishApproveFlag"
        sortNo={pageFieldJsonProject.finishApproveFlag.sortNo}
      >
        {formData.finishApproveFlag === 1
          ? '是'
          : (formData.finishApproveFlag === 0 ? '否' : '') || ''}
      </Description>,
      <Description
        term={pageFieldJsonProject.deposit.displayName}
        key="deposit"
        sortNo={pageFieldJsonProject.deposit.sortNo}
      >
        {formData.deposit}
      </Description>,
      <Description
        term={pageFieldJsonProject.muiltiTaskFlag.displayName}
        key="muiltiTaskFlag"
        sortNo={pageFieldJsonProject.muiltiTaskFlag.sortNo}
      >
        {formData.muiltiTaskFlag === 1 ? '是' : (formData.muiltiTaskFlag === 0 ? '否' : '') || ''}
      </Description>,
      <Description
        term={pageFieldJsonProject.containsCustomerFlag.displayName}
        key="containsCustomerFlag"
        sortNo={pageFieldJsonProject.containsCustomerFlag.sortNo}
      >
        {formData.containsCustomerFlag === 1
          ? '是'
          : (formData.containsCustomerFlag === 0 ? '否' : '') || ''}
      </Description>,
      <Description
        term={pageFieldJsonProject.budgetSwitchFlag.displayName}
        key="budgetSwitchFlag"
        sortNo={pageFieldJsonProject.budgetSwitchFlag.sortNo}
      >
        {formData.budgetSwitchFlag === 1
          ? '是'
          : (formData.budgetSwitchFlag === 0 ? '否' : '') || ''}
      </Description>,
    ];
    const filterList4 = authorizationFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const otherinfoFields = [
      <Description
        term={pageFieldJsonContract.userdefinedNo.displayName}
        key="userdefinedNo"
        sortNo={pageFieldJsonContract.userdefinedNo.sortNo}
      >
        {formData.userdefinedNo}
      </Description>,
      <Description
        term={pageFieldJsonProject.relatedProjId.displayName}
        key="relatedProjId"
        sortNo={pageFieldJsonProject.relatedProjId.sortNo}
      >
        {formData.relatedProjName}
      </Description>,
      <Description
        term={pageFieldJsonProject.performanceDesc.displayName}
        key="performanceDesc"
        sortNo={pageFieldJsonProject.performanceDesc.sortNo}
      >
        {formData.performanceDesc}
      </Description>,
      <Description term="绩效附件">
        <FileManagerEnhance
          api="/api/op/v1/project/performance/sfs/token"
          dataKey={param.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description
        term={
          pageFieldJsonContract.amt.displayName + '/' + pageFieldJsonContract.taxRate.displayName
        }
        key="amt"
        sortNo={pageFieldJsonContract.amt.sortNo}
      >
        {formData.amt}/{formData.taxRate}
      </Description>,
      <Description
        term={pageFieldJsonContract.effectiveAmt.displayName}
        key="effectiveAmt"
        sortNo={pageFieldJsonContract.effectiveAmt.sortNo}
      >
        {formData.effectiveAmt}
      </Description>,
      <Description
        term={pageFieldJsonProject.closeReason.displayName}
        key="closeReason"
        sortNo={pageFieldJsonProject.closeReason.sortNo}
      >
        {formData.closeReasonDesc}
      </Description>,
      <Description term="附件">
        <FileManagerEnhance
          api="/api/op/v1/project/attachment/sfs/token"
          dataKey={param.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
    ];
    const filterList5 = otherinfoFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const autoReportFields = [
      <Description
        term={pageFieldJsonProject.autoReportFlag.displayName}
        key="autoReportFlag"
        sortNo={pageFieldJsonProject.autoReportFlag.sortNo}
      >
        {formData.autoReportFlag === 1 ? '是' : '否'}
      </Description>,
    ];
    const filterList6 = autoReportFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <>
        <DescriptionList size="large" title="项目简况" col={2}>
          {filterList1}
        </DescriptionList>
        <Divider dashed />
        <DescriptionList size="large" title="相关人员" col={2}>
          {filterList2}
        </DescriptionList>
        <Divider dashed />
        <DescriptionList size="large" title="总预算信息" col={2}>
          {filterList3}
        </DescriptionList>
        <Divider dashed />
        <DescriptionList size="large" title="授权信息" col={2}>
          {filterList4}
        </DescriptionList>
        <Divider dashed />
        <DescriptionList size="large" title="其他信息" col={2}>
          {filterList5}
        </DescriptionList>
        <DescriptionList size="large" title="项目汇报策略" col={2}>
          {filterList6}
        </DescriptionList>
      </>
    );
  };

  render() {
    const {
      loading,
      dispatch,
      userProjectQuery: {
        formData,
        dataSource,
        reportBtn,
        jumpData,
        reportBtnProjExecution,
        jumpDataProjExecution,
        pageConfig,
      },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`];
    const disabledRptBtn = !loading.effects[`${DOMAIN}/projectProfitReport`] && reportBtn;
    const disabledRptBtnProjExecution =
      !loading.effects[`${DOMAIN}/projExecutionInfo`] && reportBtnProjExecution;
    const param = fromQs();

    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }

    let currentReportConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.tableName === 'T_PROJ_REPORT_PLAN') {
        currentReportConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsReport } = currentReportConfig; // 项目汇报表
    const pageFieldJsonReport = {}; // 项目汇报表
    if (pageFieldViewsReport) {
      pageFieldViewsReport.forEach(field => {
        pageFieldJsonReport[field.fieldKey] = field;
      });
    }

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        pageFieldJsonReport.periodDate.visibleFlag && {
          title: `${pageFieldJsonReport.periodDate.displayName}`,
          sortNo: `${pageFieldJsonReport.periodDate.sortNo}`,
          required: !!pageFieldJsonReport.periodDate.requiredFlag,
          dataIndex: 'periodDate',
          align: 'center',
        },
        pageFieldJsonReport.amt.visibleFlag && {
          title: `${pageFieldJsonReport.amt.displayName}`,
          sortNo: `${pageFieldJsonReport.amt.sortNo}`,
          dataIndex: 'amt',
          align: 'center',
        },
        pageFieldJsonReport.remark.visibleFlag && {
          title: `${pageFieldJsonReport.remark.displayName}`,
          sortNo: `${pageFieldJsonReport.remark.sortNo}`,
          dataIndex: 'remark',
          align: 'center',
        },
        pageFieldJsonReport.briefId.visibleFlag && {
          title: `${pageFieldJsonReport.briefId.displayName}`,
          sortNo: `${pageFieldJsonReport.briefId.sortNo}`,
          dataIndex: 'briefNo',
          align: 'center',
          render: (value, row, index) => (
            <a
              className="tw-link"
              onClick={() => router.push(`/user/project/projectReportDetail?id=${row.briefId}`)}
            >
              {row.briefNo}
            </a>
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-rightLine-more"
          title={
            <>
              <Button
                className="tw-btn-primary"
                // icon="save"
                size="large"
                disabled={disabledBtn}
                onClick={() => {
                  if (formData.projStatus !== 'CREATE') {
                    createMessage({
                      type: 'error',
                      description: '只有状态为新建的项目才可以派发。',
                    });
                    return;
                  }
                  dispatch({
                    type: `${DOMAIN}/checkDist`,
                    payload: { reasonId: formData.id, reasonType: 'PROJECT', id: formData.id },
                  });
                }}
              >
                {formatMessage({ id: `misc.distribute`, desc: '派发' })}
              </Button>
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() => router.push(`/user/project/projectActivityList?id=${formData.id}`)}
              >
                {formatMessage({ id: `misc.activity.mgt`, desc: '活动管理' })}
              </Button>
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() => router.push(`/user/project/projectShList?id=${formData.id}`)}
              >
                {formatMessage({ id: `misc.member.mgt`, desc: '成员管理' })}
              </Button>
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() =>
                  router.push(`/user/project/projectResPlanning?id=${formData.id}&planType=2`)
                }
              >
                {formatMessage({ id: `misc.res.planning`, desc: '资源规划' })}
              </Button>
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() =>
                  router.push(`/user/project/projectBudgetDetail?projId=${formData.id}`)
                }
              >
                {formatMessage({ id: `misc.project.budget`, desc: '项目预算' })}
              </Button>
              {/* <Button
                className="tw-btn-primary"
                // icon="save"
                size="large"
                disabled={disabledBtn}
                onClick={() =>
                  router.push(
                    `/sale/contract/salesSubDetail?mainId=${formData.mainContractId}&id=${
                      formData.contractId
                    }`
                  )
                }
              >
                {formatMessage({ id: `misc.check.contract`, desc: '查看合同' })}
              </Button> */}
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() => router.push(`/plat/addr/view?no=${formData.custAbNo}`)}
              >
                {formatMessage({ id: `misc.check.cust`, desc: '查看客户' })}
              </Button>
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() => router.push(`/user/project/projectLedgerIo?projId=${formData.id}`)}
              >
                {formatMessage({ id: `misc.project.ledgerio`, desc: '项目当量交易记录' })}
              </Button>
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() => router.push(`/user/project/projectLedger?projId=${formData.id}`)}
              >
                {formatMessage({ id: `misc.project.ledger`, desc: '项目账户' })}
              </Button>
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() =>
                  router.push(`/user/project/projectExpenseLogs?reasonId=${formData.id}`)
                }
              >
                项目报销记录
              </Button>
              {/* <Button
                className="tw-btn-primary"
                size="large"
                disabled={!disabledRptBtn}
                onClick={() => {
                  window.sessionStorage.setItem('reportParms', JSON.stringify(jumpData));
                  // window.open(`/BI/auth?id=${param.id}`);
                  router.push(`/user/project/projectWaitAuth?id=${param.id}`);
                }}
              >
                项目利润报表
              </Button> */}
              <Button
                className="tw-btn-primary"
                size="large"
                onClick={() => {
                  router.push(`/user/project/projectReport?projId=${param.id}`);
                }}
              >
                项目情况汇报
              </Button>
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={!disabledRptBtnProjExecution}
                onClick={() => {
                  let reportUrl = '';
                  if (getParam(jumpDataProjExecution.reportUrl, 'projID')) {
                    reportUrl = editParam(jumpDataProjExecution.reportUrl, 'projID', param.id);
                  } else {
                    reportUrl = addParam(jumpDataProjExecution.reportUrl, 'projID', param.id);
                  }
                  window.sessionStorage.setItem(
                    'reportParms',
                    JSON.stringify({
                      ...jumpDataProjExecution,
                      reportUrl,
                    })
                  );
                  router.push(`/user/project/projectWaitAuth?id=${param.id}&type=PROJ`);
                }}
              >
                项目执行情况表
              </Button>
            </>
          }
          extra={
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              disabled={disabledBtn}
              onClick={() => {
                if (param.from && param.from === 'myproject') {
                  closeThenGoto(`/user/center/myProjects`);
                } else {
                  closeThenGoto(`/user/project/projectList`);
                }
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          }
        />

        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.user.project.projectDetail"
              defaultMessage="项目详情"
            />
          }
          bordered={false}
        >
          {!loading.effects[`${DOMAIN}/getPageConfig`] ? this.renderPage() : <Loading />}
          {formData.autoReportFlag === 1 ? <DataTable {...tableProps} /> : ''}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectDetail;
