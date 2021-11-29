import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import activation from '@/assets/img/productTheme/activation.svg';
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
      <PageHeaderWrapper title="组织激活">
        <div className={styles['themes-wrap']}>
          <img src={activation} alt="activation" />
          <div />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Theme;
