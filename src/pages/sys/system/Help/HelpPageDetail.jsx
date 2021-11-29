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

const DOMAIN = 'helpPageDetail';

@connect(({ loading, helpPageDetail, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...helpPageDetail,
  dispatch,
  user,
}))
@mountToTab()
class HelpPageDetail extends PureComponent {
  componentDidMount() {
    const params = fromQs();
    this.fetchData(params);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  preview = () => {
    const params = fromQs();
    router.push('/sys/maintMgmt/help/page/preview?id=' + params.id);
  };

  render() {
    const { loading, dataSource, formData, withdrawPayFlow, dispatch } = this.props;

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            size="large"
            loading={loading}
            onClick={this.preview}
          >
            预览
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="标题">{formData.helpTitle}</Description>
            <Description term="上级页面">{formData.parentName}</Description>
            <Description term="序号">{formData.pageNumber}</Description>
            <Description term="目录显示">{formData.directoryVisibleFlag ? '是' : '否'}</Description>
            <Description term="关联URL">{formData.linkUrl}</Description>
          </DescriptionList>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: formData.helpContent }} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default HelpPageDetail;
