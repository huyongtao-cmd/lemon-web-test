import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Card, Tag } from 'antd';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';

const { Description } = DescriptionList;
const DOMAIN = 'sysMarketBanner';

@connect(({ loading, dispatch, sysMarketBanner }) => ({
  loading,
  dispatch,
  sysMarketBanner,
}))
@mountToTab()
class SystemRoleDetail extends PureComponent {
  componentDidMount() {
    const param = fromQs().id;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getDetails`,
      payload: param,
    });
  }

  handleCancel = () => {
    closeThenGoto('/plat/market/banner');
  };

  render() {
    const {
      dispatch,
      loading,
      sysMarketBanner: { details },
      // form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <DescriptionList size="large" col={2} title="基本信息">
            <Description term="横幅标题">{details.title}</Description>
            <Description term="链接">{details.url}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="分类">{details.categoryName}</Description>
            <Description term="状态">{details.docStatusName}</Description>
          </DescriptionList>
          <Description term="附件">
            <FileManagerEnhance
              api="/api/sys/v1/banner/logo/sfs/token"
              dataKey={details.id}
              listType="text"
              disabled
              preview
            />
          </Description>
          <DescriptionList size="large" col={1}>
            <Description term="备注">{details.mark}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemRoleDetail;
