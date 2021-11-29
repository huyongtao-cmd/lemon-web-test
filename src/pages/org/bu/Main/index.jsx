import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Card, Col, Row } from 'antd';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import TreeSearch from '@/components/common/TreeSearch';
import { createConfirm } from '@/components/core/Confirm';
import Loading from '@/components/core/DataLoading';
import { Selection } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { OrgBu, ChangeHistory } from './Component';

// tab的页面
const operationTabList = [
  {
    key: 'NewVersion',
    tab: '最新版本',
  },
  {
    key: 'ChangeHistory',
    tab: '变更历史',
  },
];
//
const operationTabListForOrg = [
  {
    key: 'NewVersion',
    tab: '最新版本',
  },
];
class OrgBuData extends PureComponent {
  state = {
    operationkey: 'NewVersion',
  };

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  render() {
    const { operationkey } = this.state;
    const { pathname } = window.location;
    const contentList = {
      NewVersion: <OrgBu />,
      ChangeHistory: <ChangeHistory />,
    };
    const contentListForOrg = {
      NewVersion: <OrgBu />,
    };
    return (
      <Card
        className="tw-card-multiTab"
        bordered={false}
        tabList={pathname !== '/org/bu/main' ? operationTabList : operationTabListForOrg}
        onTabChange={this.onOperationTabChange}
      >
        {pathname !== '/org/bu/main' ? contentList[operationkey] : contentListForOrg[operationkey]}
      </Card>
    );
  }
}

export default OrgBuData;
