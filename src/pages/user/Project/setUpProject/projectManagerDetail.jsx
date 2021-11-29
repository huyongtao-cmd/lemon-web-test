import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Input, Tabs } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import ApplyProjectDetail from './detail';
import SalesManagerDetail from './salesManagerDetail';

const { TabPane } = Tabs;
const { Description } = DescriptionList;
const DOMAIN = 'setUpProjectFlow';

@connect(({ loading, finishProjectFlow, dispatch }) => ({
  dispatch,
  loading,
  finishProjectFlow,
}))
@mountToTab()
class ProjectManagerDetail extends Component {
  render() {
    const { dispatch, loading } = this.props;
    return (
      <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
        <Tabs defaultActiveKey="1" onChange={activeKey => {}} type="card">
          <TabPane tab="项目信息" key="1">
            <SalesManagerDetail />
          </TabPane>
          <TabPane tab="立项申请信息" key="2">
            <ApplyProjectDetail />
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}

export default ProjectManagerDetail;
