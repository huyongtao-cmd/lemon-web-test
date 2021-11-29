// 最常用的引入,基本每个页面都需要的组件
import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Divider, Tooltip } from 'antd';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';

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
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';

const { Description } = DescriptionList;

const DOMAIN = 'withdrawPayDetail';

@connect(({ loading, withdrawPayDetail, dispatch, user }) => ({
  loading,
  ...withdrawPayDetail,
  dispatch,
  user,
}))
@mountToTab()
class WithdrawPayDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
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
          title: '相关提现单号',
          dataIndex: 'withdrawNo',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/center/withdrawDetail?id=${row.withdrawId}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '提现人',
          dataIndex: 'resName',
          align: 'center',
        },
        // {
        //   title: '提现当量',
        //   dataIndex: 'eqva',
        //   align: 'center',
        // },
        {
          title: '提现金额',
          dataIndex: 'amt',
          align: 'center',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          align: 'center',
        },
        {
          title: '提现状态',
          dataIndex: 'withdrawStatusDesc',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="提现">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            hidden
            onClick={this.handleSubmit}
          >
            提交
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="申请人">{formData.resName}</Description>
            <Description term="付款单号">{formData.withdrawPayNo}</Description>
            <Description term="申请日期">{formData.applyDate}</Description>
            <Description term="付款状态 ">{formData.withdrawPayStatusDesc}</Description>
            <Description term="付款金额">{formData.amt}</Description>
            <Description style={{ visibility: 'hidden' }} term="占位">
              占位
            </Description>
            <Description term="供应商1">{formData.supplierName}</Description>
            <Description term="供应商2">{formData.supplier2Name}</Description>
            <Description term="供应商1费率">{formData.supplierRate}</Description>
            <Description term="供应商2费率">{formData.supplier2Rate}</Description>
            <Description term="供应商1付款金额">{formData.supplierAmt}</Description>
            <Description term="供应商2付款金额">{formData.supplier2Amt}</Description>
            <Description term="备注">{formData.remark}</Description>
          </DescriptionList>
        </Card>
        <br />
        <Card title="提现列表" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>

        <Card title="生成的报销" bordered={false} className="tw-card-adjust">
          {withdrawPayFlow &&
            withdrawPayFlow.map((flow, index) => (
              <Fragment key={`${flow}`}>
                <DescriptionList key={flow} size="large" col={2}>
                  <Description>
                    <a
                      className="tw-link"
                      onClick={() => router.push('/plat/expense/withdrawPayFlowView?id=' + flow)}
                    >
                      报销单据
                      {index + 1}
                    </a>
                  </Description>
                </DescriptionList>
              </Fragment>
            ))}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WithdrawPayDetail;
