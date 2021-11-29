import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Card } from 'antd';
import tabConf from '../common/tabPageConf';

import WagePageMainDetail from './detail';
import PayObj from './payObj';
import BU from './BU';

const contentList = {
  detail: <WagePageMainDetail />,
  payObj: <PayObj />,
  BU: <BU />,
};
class WageCostDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationkey: 'detail',
    };
  }

  onOperationTabChange = key => {
    this.setState({
      operationkey: key,
    });
  };

  render() {
    const { operationkey } = this.state;
    const { loading } = this.props;
    return (
      <PageHeaderWrapper title="薪资成本明细">
        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={operationkey}
          tabList={tabConf}
          onTabChange={this.onOperationTabChange}
        >
          {contentList[operationkey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WageCostDetailPage;
