import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Divider } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { FileManagerEnhance } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';

const { Description } = DescriptionList;
const DOMAIN = 'setUpProjectFlow';

@connect(({ loading, setUpProjectFlow, dispatch }) => ({
  dispatch,
  loading,
  setUpProjectFlow,
}))
@mountToTab()
class SalesManagerDetail extends PureComponent {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  }

  render() {
    const param = fromQs();
    const {
      dispatch,
      loading,
      setUpProjectFlow: {
        queryData,
        queryData: { projectView, contractDetailView },
      },
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/queryDetail`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      dataSource: projectView ? projectView.reportPlanViews : [],
      onChange: filters => {
        this.fetchData(filters);
      },
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '期间',
          dataIndex: 'periodDate',
          align: 'center',
        },
        {
          title: '金额',
          dataIndex: 'amt',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
        },
        {
          title: '项目汇报单号',
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
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <DescriptionList size="large" title="项目简况" col={2}>
            <Description term="项目名称">{projectView ? projectView.projName : ''}</Description>
            <Description term="编号">{projectView ? projectView.projNo : ''}</Description>
            <Description term="相关子合同">
              {contractDetailView ? contractDetailView.contractName : ''}
            </Description>
            <Description term="客户行业">{projectView ? projectView.custIdstDesc : ''}</Description>
            <Description term="客户区域">
              {projectView ? projectView.custRegionDesc : ''}
            </Description>
            <Description term="交付地点">
              {projectView ? projectView.deliveryAddress : ''}
            </Description>
            <Description term="签约公司">{projectView ? projectView.ouName : ''}</Description>
            <Description term="工作类型">{projectView ? projectView.workTypeDesc : ''}</Description>
            <Description term="预计开始时间">
              {projectView ? projectView.planStartDate : ''}
            </Description>
            <Description term="预计结束时间">
              {projectView ? projectView.planEndDate : ''}
            </Description>
            <Description term="项目模板">{projectView ? projectView.projTempName : ''}</Description>
            <Description term="客户承担差旅">
              {projectView.custpaytravelFlag === 1
                ? '是'
                : (projectView.custpaytravelFlag === 0 ? '否' : '') || ''}
            </Description>
            <Description term="SOW节选">
              <FileManagerEnhance
                api="/api/op/v1/project/sow/sfs/token"
                dataKey={projectView.id}
                listType="text"
                disabled
                preview
              />
            </Description>
            <Description term="差旅餐补限额">
              {projectView ? projectView.maxTravelFee : undefined}
              /天
            </Description>
            <Description term="币种">
              {projectView ? projectView.currCodeDesc : undefined}
            </Description>
            <DescriptionList size="large" col={1}>
              <Description term="备注">
                <pre>{projectView ? projectView.remark : ''}</pre>
              </Description>
            </DescriptionList>
            <Description term="申请人">{projectView ? projectView.createUserName : ''}</Description>
            <Description term="申请日期">
              {projectView ? projectView.createTime : undefined}
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" title="相关人员" col={2}>
            <Description term="交付BU">
              {projectView ? projectView.deliBuName : undefined}
            </Description>
            <Description term="交付负责人">
              {projectView ? projectView.deliResName : undefined}
            </Description>
            <Description term="项目经理">
              {projectView ? projectView.pmResName : undefined}
            </Description>
            <Description term="项目经理当量系数">
              {projectView ? projectView.pmEqvaRatio : undefined}
            </Description>
            <Description term="销售负责人">
              {projectView ? projectView.salesmanResName : undefined}
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" title="总预算信息" col={2}>
            <Description term="预计总人天">
              {projectView ? projectView.totalDays : undefined}
            </Description>
            <Description term="预计总当量">
              {projectView ? projectView.totalEqva : undefined}
            </Description>
            <Description term="当量预估单价/总价">
              {projectView ? projectView.eqvaPrice : ''}/
              {projectView ? projectView.eqvaPriceTotal : undefined}
            </Description>
            <Description term="费用总预算">
              {projectView ? projectView.totalReimbursement : undefined}
            </Description>
            <Description term="项目预算总成本">
              {projectView ? projectView.totalCost : undefined}
            </Description>
            <Description term="预算附件">
              <FileManagerEnhance
                api="/api/op/v1/project/budget/sfs/token"
                dataKey={projectView.id}
                listType="text"
                disabled
                preview
              />
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" title="授权信息" col={2}>
            <Description term="允许使用外包">
              {projectView.epibolyPermitFlag === 1
                ? '是'
                : (projectView.epibolyPermitFlag === 0 ? '否' : '') || ''}
            </Description>
            <Description term="允许转包">
              {projectView.subcontractPermitFlag === 1
                ? '是'
                : (projectView.subcontractPermitFlag === 0 ? '否' : '') || ''}
            </Description>
            <Description term="工时结算周期">
              {projectView ? projectView.timesheetPeriodDesc : undefined}
            </Description>
            <Description term="活动完工审批">
              {projectView.finishApproveFlag === 1
                ? '是'
                : (projectView.finishApproveFlag === 0 ? '否' : '') || ''}
            </Description>
            <Description term="最低保证金（%）">
              {projectView ? projectView.deposit : undefined}
            </Description>
            <Description term="允许一人多任务包">
              {projectView.muiltiTaskFlag === 1
                ? '是'
                : (projectView.muiltiTaskFlag === 0 ? '否' : '') || ''}
            </Description>
            <Description term="是否有客户承担的费用">
              {projectView.containsCustomerFlag === 1
                ? '是'
                : (projectView.containsCustomerFlag === 0 ? '否' : '') || ''}
            </Description>
            <Description term="项目预算总开关标志">
              {projectView.budgetSwitchFlag === 1
                ? '是'
                : (projectView.budgetSwitchFlag === 0 ? '否' : '') || ''}
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" title="其他信息" col={2}>
            <Description term="参考合同">
              {projectView ? projectView.userdefinedNo : undefined}
            </Description>
            <Description term="关联项目">
              {projectView ? projectView.relatedProjName : undefined}
            </Description>
            <Description term="项目绩效规则">
              {projectView ? projectView.performanceDesc : undefined}
            </Description>
            <Description term="绩效附件">
              <FileManagerEnhance
                api="/api/op/v1/project/performance/sfs/token"
                dataKey={projectView.id}
                listType="text"
                disabled
                preview
              />
            </Description>
            <Description term="含税总金额/税率">
              {projectView ? projectView.amt : undefined}/
              {projectView ? projectView.taxRate : undefined}
            </Description>
            <Description term="有效合同额">
              {projectView ? projectView.effectiveAmt : undefined}
            </Description>
            <Description term="关闭原因">
              {projectView ? projectView.closeReasonDesc : undefined}
            </Description>
            <Description term="附件">
              <FileManagerEnhance
                api="/api/op/v1/project/attachment/sfs/token"
                dataKey={projectView.id}
                listType="text"
                disabled
                preview
              />
            </Description>
          </DescriptionList>

          <DescriptionList size="large" title="项目汇报策略" col={2}>
            <Description term="项目自动汇报">
              {projectView.autoReportFlag === 1 ? '是' : '否'}
            </Description>
            {projectView.autoReportFlag === 1 ? <DataTable {...tableProps} /> : null}
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SalesManagerDetail;
