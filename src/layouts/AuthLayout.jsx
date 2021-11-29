import React from 'react';
import { connect } from 'dva';
import DocumentTitle from 'react-document-title';
import Link from 'umi/link';

import GlobalFooter from '@/components/layout/GlobalFooter';
import { resetCacheStatus } from '@/layouts/routerControl';

import styles from './AuthLayout.less';
import logo from '../assets/img/logo.png';
import CopyRight from './CopyRight';
import { tryInitAuth } from './_util';

const links = [
  {
    key: 'privacy',
    title: '联系我们',
    href: 'http://www.elitesland.com/about-5',
  },
  {
    key: 'terms',
    title: '了解我们',
    href: 'http://www.elitesland.com/about-1',
  },
  {
    key: 'help',
    title: '帮助',
    href: 'https://dev.elitescloud.com/zentao',
  },
];

@connect(({ global, setting }) => ({
  ...setting,
}))
class AuthLayout extends React.PureComponent {
  // @TODO title
  // getPageTitle() {
  //   const { routerData, location } = this.props;
  //   const { pathname } = location;
  //   let title = 'Ant Design Pro';
  //   if (routerData[pathname] && routerData[pathname].name) {
  //     title = `${routerData[pathname].name} - Ant Design Pro`;
  //   }
  //   return title;
  // }

  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    // eslint-disable-next-line
    console.log('[EL-LOGIN]: Auth frame initializing...');
    // 在登录页加载时更新csrf
    resetCacheStatus();
    // 在单页应用框架页加载时更新csrf
    tryInitAuth.call(this, dispatch);
  }

  render() {
    const { children } = this.props;
    return (
      <>
        <DocumentTitle title="登录 - TELEWORK" />
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.left}>
              <div className={styles.top}>
                <div className={styles.header}>
                  <Link to="/">
                    {/* <img alt="上海泰列渥克旗下品牌" className={styles.logo} src={logo} /> */}
                    <span className={styles.title} />
                  </Link>
                </div>
                <div className={styles.desc} />
              </div>
            </div>
            <div className={styles.right}>{children}</div>
          </div>
          <GlobalFooter notGlobal copyright={<CopyRight />} />
        </div>
      </>
    );
  }
}

export default AuthLayout;
