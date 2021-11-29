import React, { PureComponent } from 'react';
import { Button, Card, Table } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';

const { Description } = DescriptionList;

const DOMAIN = 'userContractSaleList';

@connect(({ loading, userContractSaleList, dispatch }) => ({
  loading,
  ...userContractSaleList,
  dispatch,
}))
@mountToTab()
class AmtSettleDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    id &&
      dispatch({
        type: `${DOMAIN}/getNormSettleByContId`,
        payload: { contractId: id },
      });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        amtSettleFormData: {},
        amtSettleList: [],
      },
    });
  }

  render() {
    const { amtSettleFormData, amtSettleList = [] } = this.props;

    const columns = [
      {
        title: '支出方',
        dataIndex: 'out',
        children: [
          {
            title: '支出账户',
            dataIndex: 'outAccountName',
            align: 'center',
          },
          {
            title: '费用码',
            dataIndex: 'outFeeCodeDesc',
            align: 'center',
          },
          {
            title: '财务科目',
            dataIndex: 'outAccDesc',
            align: 'center',
          },
        ],
      },
      {
        title: '收入方',
        dataIndex: 'in',
        children: [
          {
            title: '收入账户',
            dataIndex: 'inAccountName',
            align: 'center',
          },
          {
            title: '费用码',
            dataIndex: 'inFeeCodeDesc',
            align: 'center',
          },
          {
            title: '财务科目',
            dataIndex: 'inAccDesc',
            align: 'center',
          },
        ],
      },
    ];

    return (
      <PageHeaderWrapper title="泛用金额结算">
        <Card className="tw-card-adjust" bordered={false}>
          <DescriptionList size="large" col={2} title="申请信息">
            <Description term="单据创建人">{amtSettleFormData.applyResName || ''}</Description>
            <Description term="结算单号">{amtSettleFormData.settleNo || ''}</Description>
            <Description term="单据创建类型">{amtSettleFormData.createTypeDesc || ''}</Description>
            <Description term="申请日期">{amtSettleFormData.applyDate || ''}</Description>
          </DescriptionList>

          <DescriptionList size="large" col={2} title="结算相关信息">
            <Description term="业务类型">{amtSettleFormData.busiTypeDesc || ''}</Description>
            <Description term="相关业务单据号">{amtSettleFormData.relevNo || ''}</Description>
            <Description term="相关子合同">{amtSettleFormData.contractName || ''}</Description>
            <Description term="收款号">{amtSettleFormData.recvplanName || ''}</Description>
            <Description term="相关项目">{amtSettleFormData.projName || ''}</Description>
            <Description term="交易总额">{amtSettleFormData.approveSettleAmt || ''}</Description>
            <Description term="交易日期">{amtSettleFormData.transDate || ''}</Description>
            <Description term="币种">{amtSettleFormData.currCodeDesc || ''}</Description>
            <Description term="财务期间">{amtSettleFormData.finPeriodName || ''}</Description>
          </DescriptionList>

          <DescriptionList size="large" col={2} title="交易方信息">
            <Table columns={columns} dataSource={amtSettleList} pagination={false} bordered />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AmtSettleDetail;
