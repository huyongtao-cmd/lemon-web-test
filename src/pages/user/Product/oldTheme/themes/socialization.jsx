import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import socialization from '@/assets/img/productTheme/socialization.svg';
import styles from '../index.less';

const DOMAIN = 'oldProductTheme';
@connect(({ loading, productTheme }) => ({
  productTheme,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class Theme extends PureComponent {
  componentDidMount() {}

  render() {
    return (
      <PageHeaderWrapper title="社会化链接">
        <div className={styles['themes-wrap']}>
          <img src={socialization} alt="socialization" />
          <div />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Theme;
