import React, { Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Form } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

const { Description } = DescriptionList;

const DOMAIN = 'transferMoneyDetail';

@Form.create({})
@connect(({ loading, transferMoneyDetail, dispatch }) => ({
  dispatch,
  loading,
  transferMoneyDetail,
}))
@mountToTab()
class TransferMoneyDetail extends Component {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  }

  render() {
    const {
      transferMoneyDetail: { formData },
    } = this.props;
    const { id, mode } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A66', title: '资金拨付申请' }];

    return (
      <PageHeaderWrapper>
        {!mode ? (
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => {
                const { from } = fromQs();
                closeThenGoto(markAsTab(from));
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
        ) : null}
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <DescriptionList title="资金拨付申请" size="large" col={2}>
            <Description term="资金划款编号">{formData.transferNo || ''}</Description>
            <Description term="申请人">{formData.applicantUserName || ''}</Description>
            <Description term="申请日期">{formData.applicantTime || undefined}</Description>
            <Description term="申请人所属BU">{formData.applicantBuIdName || undefined}</Description>
            <Description term="划款公司">{formData.transferCompanyName || undefined}</Description>
            <Description term="划款账号">{formData.transferAccount || undefined}</Description>
            <Description term="收款公司">{formData.collectionCompanyName || undefined}</Description>
            <Description term="收款账号">{formData.collectionAccount || undefined}</Description>
            <Description term="划款金额">{formData.transferMoney || undefined}</Description>
            <Description term="支付方式">{formData.payWayName || undefined}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="划款说明">{<pre>{formData.transferNote}</pre> || ''}</Description>
          </DescriptionList>
          <DescriptionList>
            <Description term="附件">
              <FileManagerEnhance
                api="/api/worth/v1/transfer/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
            <Description term="状态">{formData.apprStatusName || undefined}</Description>
          </DescriptionList>
        </Card>
        {!mode ? <BpmConnection source={allBpm} /> : null}
      </PageHeaderWrapper>
    );
  }
}

export default TransferMoneyDetail;
