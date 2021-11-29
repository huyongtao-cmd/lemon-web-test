// 最常用的引入,基本每个页面都需要的组件
import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Checkbox, Divider, Tooltip } from 'antd';
import { connect } from 'dva';

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

const { Description } = DescriptionList;

const DOMAIN = 'helpDirectoryDetail';

@connect(({ loading, helpDirectoryDetail, dispatch, user }) => ({
  loading,
  ...helpDirectoryDetail,
  dispatch,
  user,
}))
@mountToTab()
class HelpDirectoryDetail extends PureComponent {
  componentDidMount() {
    const params = fromQs();
    this.fetchData(params);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  render() {
    const { loading, dataSource, formData, withdrawPayFlow, dispatch } = this.props;

    return (
      <PageHeaderWrapper>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="目录名称">{formData.directoryName}</Description>
            <Description term="上级目录">{formData.topDirectoryName}</Description>
            <Description term="序号">{formData.directoryNumber}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default HelpDirectoryDetail;
