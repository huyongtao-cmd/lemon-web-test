import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import electronicAsset from '@/assets/img/productTheme/electronicAsset.svg';
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
      <PageHeaderWrapper title="电子资产">
        <div className={styles['themes-wrap']}>
          <img src={electronicAsset} alt="electronicAsset" />
          <div />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Theme;
