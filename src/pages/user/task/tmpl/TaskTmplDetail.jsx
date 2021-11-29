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

const DOMAIN = 'taskTmplDetail';

@connect(({ loading, taskTmplDetail, dispatch, user }) => ({
  loading,
  ...taskTmplDetail,
  dispatch,
  user,
}))
@mountToTab()
class TaskTmplDetail extends PureComponent {
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
          title: '活动编码',
          dataIndex: 'actNo',
          align: 'center',
        },
        {
          title: '活动名称',
          dataIndex: 'actName',
          align: 'center',
        },
        {
          title: '活动当量',
          dataIndex: 'eqvaQty',
          align: 'center',
        },
        {
          title: '里程碑',
          dataIndex: 'milestoneFlag',
          align: 'center',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '要求文档清单',
          dataIndex: 'requiredDocList',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="任务模板">
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="名称">{formData.tmplName}</Description>
            <Description term="申请人">{formData.resName}</Description>
            <Description term="权限类型 ">{formData.permissionTypeDesc}</Description>
            <Description term="事由类型">{formData.reasonTypeDesc}</Description>
            <Description term="完工附件上传方法">{formData.attachuploadMethod}</Description>
            <Description term="备注">{formData.remark}</Description>
          </DescriptionList>
        </Card>
        <br />
        <Card title="任务活动" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TaskTmplDetail;
