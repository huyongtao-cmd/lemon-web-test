import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Card, Tag } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';

const { Description } = DescriptionList;
const DOMAIN = 'sysroleDetail';

@connect(({ sysroleDetail }) => ({ sysroleDetail }))
@mountToTab()
class SystemRoleDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id },
    });
  }

  handleCancel = () => {
    closeThenGoto('/sys/powerMgmt/role');
  };

  render() {
    const { sysroleDetail } = this.props;
    const { formData } = sysroleDetail;

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
            <Description term={formatMessage({ id: 'sys.system.name', desc: '名称' })}>
              {formData.name}
            </Description>
            <Description term={formatMessage({ id: 'sys.system.code', desc: '编号' })}>
              {formData.code}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term={formatMessage({ id: 'sys.system.remark', desc: '备注' })}>
              {formData.remark}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term={formatMessage({ id: 'sys.system.roles.navs', desc: '导航清单' })}>
              {(formData.navs || []).map(nav => (
                <Tag key={nav}>{nav}</Tag>
              ))}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term={formatMessage({ id: 'sys.system.roles.raabs', desc: '能力清单' })}>
              {(formData.raabs || []).map(raab => (
                <Tag key={raab.code}>{raab.name}</Tag>
              ))}
            </Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemRoleDetail;
