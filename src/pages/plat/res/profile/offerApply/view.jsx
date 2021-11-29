import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Radio, Divider } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import router from 'umi/router';

const { Description } = DescriptionList;

const DOMAIN = 'offerApply';

@connect(({ loading, offerApply, dispatch }) => ({
  loading,
  offerApply,
  dispatch,
}))
@mountToTab()
class OfferApplyView extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: { resId: id },
      });
    });
  }

  render() {
    const {
      offerApply: { formData },
    } = this.props;
    const { id } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A30', title: 'Offer发放及入职流程' }];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              router.goBack();
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="Offer发放及入职流程详情" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="流程编号">{formData.abNo || ''}</Description>
            <Description term="状态">{formData.apprStatusName || ''}</Description>
            <Description term="资源">
              {formData.resNo || ''}
              {formData.resNo ? '-' : ''}
              {formData.resName || ''}
            </Description>
            <Description term="是否入职">
              {// eslint-disable-next-line no-nested-ternary
              formData.deliverOffer === 'YES' ? '是' : formData.deliverOffer === 'NO' ? '否' : ''}
            </Description>
            <Description term="未入职原因">
              {<pre>{formData.noneOfferReason}</pre> || ''}
            </Description>
            <Description term="入职日期">{formData.contractEndDate || ''}</Description>
            <Description term="资源类别">
              {formData.resType === 'GENERAL' ? '一般资源' : '销售BU' || ''}
            </Description>
            <Description term="BaseBU">{formData.baseBuName || ''}</Description>
            <Description term="Base地">{formData.baseCityName || ''}</Description>
            <Description term="岗位">{formData.job || ''}</Description>
            <Description term="合作方式">{formData.coopTypeName || ''}</Description>
            <Description term="申请人">{formData.applyResName || ''}</Description>
            <Description term="申请时间">{formData.applyDate || ''}</Description>
          </DescriptionList>
        </Card>
        <BpmConnection source={allBpm} />
      </PageHeaderWrapper>
    );
  }
}

export default OfferApplyView;
