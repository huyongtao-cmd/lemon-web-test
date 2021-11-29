import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import cooperation from '@/assets/img/productTheme/cooperation.svg';
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
      <PageHeaderWrapper title="任务协作">
        <div className={styles['themes-wrap']}>
          <img src={cooperation} alt="cooperation" />
          <div />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Theme;
