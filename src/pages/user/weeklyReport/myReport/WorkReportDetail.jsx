// 最常用的引入,基本每个页面都需要的组件
import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Checkbox, Divider, Tooltip } from 'antd';
import { connect } from 'dva';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import { FileManagerEnhance } from '@/pages/gen/field';

const { Description } = DescriptionList;

const DOMAIN = 'workReportDetail';

@connect(({ loading, workReportDetail, dispatch, user }) => ({
  loading,
  ...workReportDetail,
  dispatch,
  user,
}))
@mountToTab()
class WorkReportDetail extends PureComponent {
  componentDidMount() {
    const params = fromQs();
    this.fetchData(params);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  render() {
    const { loading, dataSource, formData, withdrawPayFlow, dispatch } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
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
        {
          title: '日期',
          dataIndex: 'workDate',
          required: true,
          width: '10%',
        },
        {
          title: '工作总结',
          // dataIndex: 'workDesc',
          dataIndex: 'workSummary',
          required: true,
          width: '30%',
        },
        {
          title: '工作计划',
          // dataIndex: 'workPlanId',
          dataIndex: 'workPlanName',
          required: true,
          width: '20%',
        },
        {
          title: '需协调工作',
          // dataIndex: 'remark',
          dataIndex: 'helpWork',
          required: true,
          width: '30%',
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2}>
            <Description term="填报人">{formData.reportResIdName}</Description>
            <Description term="汇报期间">
              {`${formData.dateStart || ''} ~ ${formData.dateEnd || ''}`}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="工作总结">{formData.workSummary}</Description>
            <Description term="未完成工作">{formData.unfinishedWork}</Description>
            <Description term="需协调工作">{formData.helpWork}</Description>
            <Description term="附件">
              <FileManagerEnhance
                api="/api/op/v1/workReport/workReportAttachment/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="汇报给">{formData.reportToResIdName}</Description>
            <Description term="报告状态">{formData.reportStatusName}</Description>
          </DescriptionList>
        </Card>
        <br />
        <Card title="工作日志说明" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WorkReportDetail;
