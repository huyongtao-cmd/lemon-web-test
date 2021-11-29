import React, { PureComponent } from 'react';
import moment from 'moment';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Card, Divider } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { closeThenGoto } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';

const { Description } = DescriptionList;

const DOMAIN = 'sysBasicProfitdistRuleDetail';

@connect(({ loading, sysBasicProfitdistRuleDetail, dispatch }) => ({
  loading,
  sysBasicProfitdistRuleDetail,
  dispatch,
}))
class ProfitdistRuleDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    });
  }

  render() {
    const {
      loading,
      sysBasicProfitdistRuleDetail: { formData },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={disabledBtn}
            onClick={() => closeThenGoto('/plat/distInfoMgmt/profitdistRule')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.sys.baseinfo.profitdistRuleQuery"
              defaultMessage="利益分配规则详情"
            />
          }
          bordered={false}
        >
          <DescriptionList size="large" title="BU信息" col={2} hasSeparator>
            <Description term="平台">{formData.busifieldTypeName}</Description>
            <Description term="BU">{formData.buName}</Description>
            <Description term="BU类别">{formData.buFactor1Name}</Description>
            <Description term="BU小类">{formData.buFactor2Name}</Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" title="客户信息" col={2} hasSeparator>
            <Description term="客户">{formData.custName}</Description>
            <Description term="客户性质">{formData.custFactor3Name}</Description>
            <Description term="客户小类">{formData.custFactor2Name}</Description>
            <Description term="客户类别">{formData.custFactor1Name}</Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" title="产品大类" col={2} hasSeparator>
            <Description term="销售品项">{formData.prodName}</Description>
            <Description term="供应主体类别">{formData.prodFactor3Name}</Description>
            <Description term="产品大类">{formData.prodFactor1Name}</Description>
            <Description term="产品小类">{formData.prodFactor2Name}</Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" title="交易方式" col={2} hasSeparator>
            <Description term="提成类别">{formData.projFactor1Name}</Description>
            <Description term="交易性质">{formData.cooperationTypeName}</Description>
            <Description term="交易方式">{formData.channelTypeName}</Description>
            <Description term="促销码">{formData.promotionTypeName}</Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" title="利益分配规则" col={2} hasSeparator>
            <Description term="利益分配规则码">{formData.ruleNo}</Description>
            <Description term="签单法人主体">{formData.ouName}</Description>
            <Description term="平台BU抽成比例">{formData.platSharePercent}</Description>
            <Description term="基于">{formData.platShareBaseName}</Description>
            <Description term="签单BU抽成比例">{formData.signSharePercent}</Description>
            <Description term="基于">{formData.signShareBaseName}</Description>
            <Description term="售前抽成比例">{formData.deliSharePercent}</Description>
            <Description term="基于">{formData.deliShareBaseName}</Description>
            <Description term="行业补贴比例">{formData.leadsSharePercent}</Description>
            <Description term="基于">{formData.leadsShareBaseName}</Description>
            <DescriptionList size="large" col={1}>
              <Description term="备注">
                <pre>{formData.remark}</pre>
              </Description>
            </DescriptionList>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ProfitdistRuleDetail;
