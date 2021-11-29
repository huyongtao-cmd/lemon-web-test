import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Card, Tag } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';

const { Description } = DescriptionList;
const DOMAIN = 'sysuserDetail';

@connect(({ sysuserDetail }) => ({ sysuserDetail }))
@mountToTab()
class SystemUserDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id },
    });
  }

  handleCancel = () => {
    closeThenGoto('/sys/system/user');
  };

  render() {
    const { sysuserDetail } = this.props;
    const { formData, raabs } = sysuserDetail;

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
          <DescriptionList size="large" col={1} title="用户详情">
            <Description term={formatMessage({ id: 'sys.system.users.type', desc: '类型' })}>
              {formData.type}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term={formatMessage({ id: 'sys.system.users.name', desc: '用户名' })}>
              {formData.name}
            </Description>
            <Description term={formatMessage({ id: 'sys.system.users.title', desc: '抬头' })}>
              {formData.title}
            </Description>
            <Description term={formatMessage({ id: 'sys.system.email', desc: '邮箱' })}>
              {formData.email}
            </Description>
            <Description term={formatMessage({ id: 'sys.system.phone', desc: '手机号' })}>
              {formData.phone}
            </Description>
            <Description
              term={formatMessage({ id: 'sys.system.users.signUpTime', desc: '注册时间' })}
            >
              {formatDT(formData.signUpTime, 'YYYY-MM-DD HH:mm:ss')}
            </Description>
            <Description
              term={formatMessage({ id: 'sys.system.users.activeTime', desc: '激活时间' })}
            >
              {formatDT(formData.activeTime, 'YYYY-MM-DD HH:mm:ss')}
            </Description>
            <Description term={formatMessage({ id: 'sys.system.users.builtIn', desc: '内置' })}>
              {formData.builtIn ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>}
            </Description>
            <Description term={formatMessage({ id: 'sys.system.status', desc: '状态' })}>
              {formData.disabled ? <Tag color="red">无效</Tag> : <Tag color="green">有效</Tag>}
            </Description>
            {/* <Description term={formatMessage({ id: 'sys.system.resName', desc: '资源名称' })}>
              {formData.resName}
            </Description>
            <Description term={formatMessage({ id: 'sys.system.resNo', desc: '资源编号' })}>
              {formData.resNo}
            </Description> */}
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term={formatMessage({ id: 'sys.system.role', desc: '角色' })}>
              {(formData.roles || []).map(role => (
                <Tag key={role.name}>{role.name}</Tag>
              ))}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term={formatMessage({ id: 'sys.system.roles.raabs', desc: '能力清单' })}>
              {(raabs || []).map(raab => (
                <Tag key={raab.code}>{raab.name}</Tag>
              ))}
            </Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemUserDetail;
