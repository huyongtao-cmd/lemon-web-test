import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import classnames from 'classnames';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

const DOMAIN = 'platRecvDetail';
const { Description } = DescriptionList;

@connect(({ loading, dispatch, platRecvDetail }) => ({
  loading,
  dispatch,
  platRecvDetail,
}))
@mountToTab()
class RecvDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: id,
    });
  }

  render() {
    const {
      platRecvDetail: { formData },
    } = this.props;

    return (
      <PageHeaderWrapper title="销售子合同详情">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => router.goBack()}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="收款计划详情" />}
          bordered={false}
        >
          <DescriptionList size="large" title="合同信息" col={2} hasSeparator>
            <Description term="主合同名称">{formData.contractName}</Description>
            <Description term="客户名称">{formData.custName}</Description>
            <Description term="子合同号">{formData.subContractNo}</Description>
            <Description term="子合同名称">{formData.subContractName}</Description>
            <Description term="参考合同号">{formData.userdefinedNo}</Description>
          </DescriptionList>

          <DescriptionList size="large" title="利益相关方" col={2} hasSeparator>
            <Description term="签单BU">{formData.signBuName}</Description>
            <Description term="销售负责人">{formData.salesmanResName}</Description>
            <Description term="交付BU">{formData.deliBuName}</Description>
            <Description term="交付负责人">{formData.deliResName}</Description>
            <Description term="项目经理">{formData.pmResName}</Description>
          </DescriptionList>

          <DescriptionList size="large" title="收款信息" col={2} hasSeparator>
            <Description term="收款号">{formData.recvNo}</Description>
            <Description term="收款阶段">{formData.phaseDesc}</Description>
            <Description term="当期收款金额/比例">{`${formData.recvAmt} / ${+formData.recvRatio *
              100}%`}</Description>
            <Description term="预计收款日期">{formData.expectRecvDate}</Description>
            <Description term="税率">{formData.taxRate + '%'}</Description>
            <Description term="收款状态/开票状态">{`${formData.recvStatusDesc} / ${
              formData.batchStatusDesc
            }`}</Description>
            <Description term="开票日期">{formData.invDate}</Description>
            <Description term="已开票金额/未开票金额">{`${formData.invAmt} / ${
              formData.unInvAmt
            }`}</Description>
            <Description term="实际收款日期">{formData.actualRecvDate}</Description>
            <Description term="已收款金额/未收款金额">{`${formData.actualRecvAmt} / ${
              formData.unActualRecvAmt
            }`}</Description>
            <Description term="已确认金额">{formData.confirmedAmt}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default RecvDetail;
