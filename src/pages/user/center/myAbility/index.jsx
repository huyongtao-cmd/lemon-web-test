import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Menu } from 'antd';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import CompoundAbility from './AbilityPromote/CompoundAbility';
import CheckAbility from './CheckAbility';
import Record from './ApplicationRecord';
import styles from './index.less';

const DOMAIN = 'myAbilityGrowth';

@connect(({ loading, dispatch, myAbilityGrowth }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  myAbilityGrowth,
}))
@mountToTab()
class GrowthInfo extends PureComponent {
  state = {
    current: '0',
  };

  handleClick = e => {
    this.setState({
      current: e.key,
    });
  };

  render() {
    const { dispatch, loading } = this.props;
    const { current } = this.state;
    return (
      <PageHeaderWrapper title="我的赋能">
        <div className={styles.myAbilityGrowthBox}>
          <Menu onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">
            <Menu.Item key="0">考核中能力</Menu.Item>
            <Menu.Item key="1">能力晋升</Menu.Item>
            <Menu.Item key="2">能力申请记录</Menu.Item>
          </Menu>
        </div>
        <div style={{ height: '6px' }} />
        {current === '0' && <CheckAbility />}
        {current === '1' && <CompoundAbility />}
        {current === '2' && <Record />}
      </PageHeaderWrapper>
    );
  }
}

export default GrowthInfo;
