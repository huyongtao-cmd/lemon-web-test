import React, { Component, Fragment } from 'react';
import { Card, Divider } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { closeThenGoto } from '@/layouts/routerControl';
import JDEWageExport from './JDEWageExport';
import BaseInfoForm from './baseInfoForm';

const DOMAIN = 'wageCostMainPage';
@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
class WagePageInfoDetail extends Component {
  goBpm = router => {
    router && closeThenGoto(router);
  };

  render() {
    return (
      <PageHeaderWrapper title="新增成本管理">
        <FieldList layout="horizontal" legend="基本信息" />
        <Divider dashed />
        <Card
          className={['tw-card-adjust']}
          headStyle={{ background: '#fff' }}
          bordered={false}
          bodyStyle={{ padding: '0px' }}
        >
          <BaseInfoForm />
        </Card>
        <FieldList layout="horizontal" legend="单据明细" />
        <Divider dashed />
        <JDEWageExport />
      </PageHeaderWrapper>
    );
  }
}

export default WagePageInfoDetail;
