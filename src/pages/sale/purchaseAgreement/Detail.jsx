import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Card, Button, Spin, Form, Modal, Input } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';

import ContractDetail from './component/ContractDetail';
import DocumentDetail from './component/DocumentDetail';
import AssociatedResourcesDetail from './component/AssociatedResourcesDetail';
import SettlementRateDetail from './component/SettlementRateDetail';
import RelatedAgreementsDetail from './component/RelatedAgreementsDetail';
import PaymentDetails from './component/PaymentDetails';
import WithdrawalApplicationDetail from './component/WithdrawalApplicationDetail';

const tabConf = [
  {
    key: 'contract',
    tab: '采购合同信息',
  },
  {
    key: 'document',
    tab: '单据信息',
  },
  {
    key: 'resources',
    tab: '关联资源',
  },
  {
    key: 'rate',
    tab: '人力资源结算费率',
  },
  {
    key: 'agreements',
    tab: '关联协议',
  },
  {
    key: 'payment',
    tab: '付款明细',
  },
  {
    key: 'application',
    tab: '提现申请',
  },
];

const contentList = {
  contract: <ContractDetail />,
  document: <DocumentDetail />,
  resources: <AssociatedResourcesDetail />,
  rate: <SettlementRateDetail />,
  agreements: <RelatedAgreementsDetail />,
  payment: <PaymentDetails />,
  application: <WithdrawalApplicationDetail />,
};

const DOMAIN = 'salePurchaseAgreementsDetail';

@connect(({ loading, salePurchaseAgreementsDetail }) => ({
  loading,
  salePurchaseAgreementsDetail,
}))
// @mountToTab()
class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationkey: 'contract',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, pageMode, taskId } = fromQs();
    dispatch({
      type: `${DOMAIN}/clear`,
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'PURCHASE_AGREEMENT_DETAILS',
      },
    });
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: id,
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
    const {
      loading,
      salePurchaseAgreementsDetail: { detailData },
    } = this.props;
    return (
      <PageHeaderWrapper title="薪资成本管理">
        <Spin
          spinning={
            loading.effects[`${DOMAIN}/queryDetail`] ||
            loading.effects[`${DOMAIN}/getPageConfig`] ||
            false
          }
        >
          <Card
            className="tw-card-multiTab"
            bordered={false}
            activeTabKey={operationkey}
            tabList={tabConf}
            onTabChange={this.onOperationTabChange}
          >
            {contentList[operationkey]}
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Detail;
