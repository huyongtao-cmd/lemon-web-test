import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Card, Spin } from 'antd';
import Title from '@/components/layout/Title';
import { connect } from 'dva';
import tabConf from '../common/tabPageConf';
import { fromQs } from '@/utils/stringUtils';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

import WagePageInfoDetail from '../components/detail';
import PayObj from '../components/payObj';
import BU from '../components/BU';

const contentList = {
  detail: <WagePageInfoDetail />,
  payObj: <PayObj />,
  BU: <BU />,
};
const DOMAIN = 'wageCostMainPage';
@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
class WageCostMainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationkey: 'detail',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/getViewItem`,
        payload: {
          id: param.id,
        },
      });
    }
  }

  onOperationTabChange = key => {
    this.setState({
      operationkey: key,
    });
  };

  render() {
    const { operationkey } = this.state;
    const { loading } = this.props;
    const { id } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A68', title: '薪资成本审批流程' }];
    return (
      <PageHeaderWrapper title="薪资成本详情">
        <Spin spinning={loading.effects[`wageCostMainPage/getViewItem`] || false}>
          <Card
            className={['tw-card-adjust']}
            title={
              <Title
                icon="profile"
                id="ui.menu.plat.expense.wageCostInfo"
                defaultMessage="薪资成本详情"
              />
            }
            headStyle={{ background: '#fff' }}
            bodyStyle={{ padding: '0px' }}
            bordered={false}
          />
          <Card
            className="tw-card-multiTab"
            bordered={false}
            activeTabKey={operationkey}
            tabList={tabConf}
            onTabChange={this.onOperationTabChange}
          >
            {contentList[operationkey]}
          </Card>
          <BpmConnection source={allBpm} />
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default WageCostMainPage;
