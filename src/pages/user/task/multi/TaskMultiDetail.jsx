// 最常用的引入,基本每个页面都需要的组件
import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Checkbox, Divider, Tooltip } from 'antd';
import { connect } from 'dva';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';

const { Description } = DescriptionList;

const DOMAIN = 'taskMultiDetail';

@connect(({ loading, taskMultiDetail, dispatch, user }) => ({
  loading,
  ...taskMultiDetail,
  dispatch,
  user,
}))
@mountToTab()
class TaskMultiDetail extends PureComponent {
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
          title: '任务名称',
          dataIndex: 'taskName',
          align: 'center',
        },
        {
          title: '任务备注',
          dataIndex: 'taskContent',
          align: 'center',
        },
        {
          title: '负责人',
          dataIndex: 'receiverResName',
          align: 'center',
        },
        {
          title: '预计开始日期',
          dataIndex: 'planStartDate',
          align: 'center',
        },
        {
          title: '预计结束日期',
          dataIndex: 'planEndDate',
          align: 'center',
        },
        {
          title: '关联实际任务',
          dataIndex: 'taskId',
          align: 'center',
          render: (value, row, index) =>
            value ? (
              <Link className="tw-link" to={`/user/task/view?id=${value}`}>
                查看任务
              </Link>
            ) : (
              ''
            ),
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
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="名称">{formData.multiName}</Description>
            <Description term="发包人">{formData.disterResName}</Description>
            {/* <Description term="复合能力 ">{formData.capasetLevelName}</Description> */}
            <Description term="事由类型">{formData.reasonTypeDesc}</Description>
            <Description term="事由号">{formData.reasonName}</Description>
            <Description term="费用承担BU">{formData.expenseBuName}</Description>
            <Description term="备注">{formData.remark}</Description>
          </DescriptionList>
        </Card>
        <br />
        <Card title="任务分配明细" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TaskMultiDetail;
