// 最常用的引入,基本每个页面都需要的组件
import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Checkbox, Divider, Tooltip } from 'antd';
import { connect } from 'dva';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import Link from 'umi/link';

const { Description } = DescriptionList;

const DOMAIN = 'tenantDetail';

@connect(({ loading, tenantDetail, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...tenantDetail,
  dispatch,
  user,
}))
@mountToTab()
class TenantDetail extends PureComponent {
  componentDidMount() {
    const params = fromQs();
    this.fetchData(params);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  render() {
    const { formData } = this.props;

    return (
      <PageHeaderWrapper>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="名称">{formData.tenantName}</Description>
            <Description term="编号">{formData.tenantCode}</Description>
            <Description term="用户上限">{formData.userMax}</Description>
            <Description term="域名">{formData.subDomain}</Description>
            <Description term="失效日期">{formData.expiredDate}</Description>
            <Description term="联系电话">{formData.contactPhone}</Description>
            <Description term="联系邮箱">{formData.contactEmail}</Description>
            <Description term="联系地址">{formData.contactAddress}</Description>
            <Description term="备注">{formData.remark}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TenantDetail;
