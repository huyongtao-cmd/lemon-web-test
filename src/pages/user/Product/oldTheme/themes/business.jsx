import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import business from '@/assets/img/productTheme/business.svg';
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
      <PageHeaderWrapper title="业务管理">
        <div className={styles['themes-wrap']}>
          <img src={business} alt="business" />
          <div />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Theme;
