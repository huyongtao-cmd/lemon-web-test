import React from 'react';
import { Dropdown, Icon, Layout, Menu, Tabs } from 'antd';
import DocumentTitle from 'react-document-title';
import { equals, isNil } from 'ramda';
import memoizeOne from 'memoize-one';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import SiderMenu from '@/components/layout/SiderMenu';
import Authorized, { reloadAuthorized } from '@/layouts/Authorized';
import SettingDrawer from '@/components/layout/SettingDrawer';
import { createConfirm } from '@/components/core/Confirm';
import PageLoading from '@/components/core/PageLoading';
import elGlobal from '@/utils/elGlobal';
import logo from '../assets/img/logo.svg';
import Footer from './Footer';
import Header from './Header';
import Context from './MenuContext';
import { fromQs } from '@/utils/stringUtils';
import Exception403 from '../pages/gen/Exception/403';
import { menuDataFormatter, tryInitAuth, mergeRoutes, consoleNavs } from './_util';
import styles from '../components/layout/TabBar/index.less';
import createMessage from '../components/core/AlertMessage';
import { getBreadcrumb } from '../components/_utils/pathTools';

window.elGlobal = elGlobal;

const getBreadcrumbNameMapStatic = routes => {
  const routes2 = menuDataFormatter(routes);
  const routerMap = {};
  const mergeMenuAndRouter = data => {
    data.forEach(menuItem => {
      if (menuItem.children) {
        mergeMenuAndRouter(menuItem.children);
      }
      // Reduce memory usage
      routerMap[menuItem.path] = menuItem;
    });
  };
  mergeMenuAndRouter(routes2);
  return routerMap;
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

@connect(({ global, uiSettings, loading }) => ({
  layout: uiSettings.layout,
  collapsed: global.collapsed,
  metaNameSpace: global.meta,
  tabData: global.tabData,
  authRoutes: global.authRoutes,
  logoInfo: global.logoInfo,
  extensionInfo: global.extensionInfo,
  tenantAuthRoutes: global.tenantAuthRoutes,
  panes: global.panes,
  activePane: global.activePane,
  prevClosePane: global.prevClosePane,
  prevCloseIndex: global.prevCloseIndex,
  homepage: global.homepage,
  ...uiSettings,
  loading,
}))
class BasicLayout extends React.Component {
  state = {
    rendering: true,
    isMobile: false,
    csrfLoaded: false,
  };

  constructor(props) {
    super(props);
    // this.getPageTitle = memoizeOne(this.getPageTitle);
    // this.getBreadcrumbNameMap = memoizeOne(this.getBreadcrumbNameMap, equals);
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    // this.matchParamsPath = memoizeOne(this.matchParamsPath, equals);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      panes,
      activePane,
      children,
      dispatch,
      route,
      location,
      prevClosePane,
      prevCloseIndex,
    } = nextProps;
    const paneKey = location.pathname;
    const temp = location.search.length > 0 && location.search.indexOf('?') === -1 ? '?' : '';
    const paneUrl = paneKey + temp + location.search;
    const index = panes.findIndex(pane => pane.key === activePane);
    const urlParamFlag =
      panes[index] &&
      panes[index].key === paneKey &&
      !equals(fromQs(panes[index].url), fromQs(paneUrl));
    let prevClosePaneTemp = prevClosePane;
    if (activePane === undefined) {
      if (prevClosePane === paneUrl) {
        return null;
      }
      prevClosePaneTemp = '';
    }
    if (!panes.some(pane => pane.key === paneKey) || urlParamFlag) {
      const maxTab = 15;
      if (!urlParamFlag && panes.length >= maxTab) {
        createMessage({
          type: 'warn',
          description: `页签数量超过最大数: ${maxTab},请关闭部分页签`,
        });
        return null;
      }
      const memoizeBread = memoizeOne(getBreadcrumbNameMapStatic);
      const { locale = 'ui.menu.missing' } = getBreadcrumb(memoizeBread(route.routes), paneKey);
      if (urlParamFlag === undefined) {
        panes.splice(prevCloseIndex, 0, {
          key: paneKey,
          content: React.cloneElement(children, { key: paneUrl }),
          title: formatMessage({ id: locale, desc: paneKey }),
          url: paneUrl,
        });
      } else {
        panes.splice(urlParamFlag ? index : index + 1, urlParamFlag ? 1 : 0, {
          key: paneKey,
          content: React.cloneElement(children, { key: paneUrl }),
          title: formatMessage({ id: locale, desc: paneKey }),
          url: paneUrl,
        });
      }

      dispatch({
        type: 'global/updateState',
        payload: {
          panes: [...panes],
          activePane: paneKey,
          prevClosePane: prevClosePaneTemp,
        },
      });
    } else {
      dispatch({
        type: 'global/updateState',
        payload: {
          activePane: paneKey,
          prevClosePane: prevClosePaneTemp,
        },
      });
    }
    return null;
  }

  // componentWillMount() {
  //   const { dispatch } = this.props;
  // eslint-disable-next-line
  // console.warn(
  //   [
  //     '[EL-TIPS]: To developer - ',
  //     '\tThis will ONLY appear ONCE when trying enter main page. Hot module reload (HMR) may cause multiple executions when basic layout changes.',
  //     '\tSince React.js exec render() on every state updates, multiple logs appear in the same render() means state of designated component or in Redux has been updated that many times.',
  //     "\tDon't panic, sip some java and relax.",
  //   ].join('\n')
  // ); // hmm, 不理解架构的朋友们得了解一下。

  // 在单页应用框架页加载时更新csrf

  // }

  componentDidMount() {
    const { dispatch } = this.props;
    tryInitAuth.call(this, dispatch);
    // 用户权限
    dispatch({
      type: 'user/authChecking',
    }).then(principal => {
      // eslint-disable-next-line
      if (principal) {
        //获取头像信息
        dispatch({
          type: 'user/getAvatarFn',
        });
        // 更新前端信息
        // request auth permission menus
        dispatch({
          type: 'global/queryTenantAuthMenus',
        });
        // 获取系统配置
        dispatch({
          type: 'global/querySysHomeConfig',
        });

        // 获取页面 logo 以及右上角辅助菜单
        // dispatch({
        //   type: 'global/querySysLogoAndExtension',
        // });

        // 获取多页面共用数据
        dispatch({
          type: 'global/queryCommonData',
        });

        // 获取前端国际化信息
        dispatch({
          type: 'global/getPortalLocale',
        });
        // 获取前端消息提醒
        dispatch({
          type: 'global/getPortalRemind',
        });

        // 用户前端UI设置
        dispatch({
          type: 'uiSettings/getSetting',
        });

        principal === true
          ? window.location.reload()
          : (this.renderRef = requestAnimationFrame(() => {
              this.setState({
                rendering: false,
              });
            }));
      } else {
        reloadAuthorized();
        router.replace('/auth/login');
        window.location.reload();
        this.renderRef = requestAnimationFrame(() => {
          this.setState({
            rendering: false,
          });
        });
      }
    });

    this.enquireHandler = enquireScreen(mobile => {
      const { isMobile } = this.state;
      if (isMobile !== mobile) {
        this.setState({
          isMobile: mobile,
        });
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    // eslint-disable-next-line
    return !!this.state.csrfLoaded;
  }

  componentDidUpdate(preProps) {
    // After changing to phone mode,
    // if collapsed is true, you need to click twice to display
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    const { isMobile } = this.state;
    const { collapsed } = this.props;
    if (isMobile && !preProps.isMobile && !collapsed) {
      this.handleMenuCollapse(false);
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.renderRef);
    unenquireScreen(this.enquireHandler);
  }

  // 将父组件中的值传递给子组件
  getContext = () => {
    const {
      location,
      route: { routes },
    } = this.props;
    return {
      location,
      breadcrumbNameMap: this.getBreadcrumbNameMap(),
      breadcrumbNameMapUnlimited: this.getBreadcrumbNameMap(menuDataFormatter(routes)),
    };
  };

  getMenuData = meta => {
    const {
      route: { routes: umiRoutes },
      authRoutes,
    } = this.props;
    // tag:: for print routs2sql
    // 菜单权限，注意！！！！不要随便提交，除非你知道自己在做什么！！！
    // const routes = [...umiRoutes]; // 没有权限管控，全部菜单开放
    const routes = mergeRoutes(authRoutes, umiRoutes); // 菜单权限管控打开，登录角色只能看到所属角色的菜单
    if (meta) {
      return menuDataFormatter(
        this.findWhichMenuShouldIUseUnderCurrentMeta(routes, meta),
        `${meta}/`,
        void 0,
        `ui.menu.${meta}`
      );
    }

    // Common situation
    return menuDataFormatter(routes);
  };

  /**
   * 获取面包屑映射
   * @param {Object} menuData 菜单配置
   */
  getBreadcrumbNameMap = routes => {
    const routerMap = {};
    const mergeMenuAndRouter = data => {
      data.forEach(menuItem => {
        if (menuItem.children) {
          mergeMenuAndRouter(menuItem.children);
        }
        // Reduce memory usage
        routerMap[menuItem.path] = menuItem;
      });
    };
    mergeMenuAndRouter(routes || this.getMenuData());
    return routerMap;
  };

  getSideMenu = metaNameSpace => {
    const filterMenuData = menuData =>
      menuData.map(item => ({
        ...item,
        children: item.children && filterMenuData(item.children),
      }));
    return filterMenuData(this.getMenuData(metaNameSpace));
  };

  // The truth lies within the sacred code befell - in a humble place the last child dwell.
  // - by Richard, with love.
  findWhichMenuShouldIUseUnderCurrentMeta = (routes, meta) =>
    (routes.filter(menu => menu.meta && menu.name === meta).pop() || {}).routes || [];

  matchParamsPath = pathname => {
    const pathKey = Object.keys(this.breadcrumbNameMap).find(key =>
      pathToRegexp(key).test(pathname)
    );
    return this.breadcrumbNameMap[pathKey];
  };

  getPageTitle = pathname => {
    const currRouterData = this.matchParamsPath(pathname);

    if (!currRouterData) {
      return 'TELEWORK 办公平台';
    }
    const message = formatMessage({
      id: currRouterData.locale || currRouterData.name,
      defaultMessage: currRouterData.name,
    });
    return `${message} - TELEWORK 办公平台`;
  };

  getLayoutStyle = () => {
    const { isMobile } = this.state;
    const { fixSiderbar, collapsed, layout } = this.props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '220px',
      };
    }
    return null;
  };

  getContentStyle = () => {
    const { fixedHeader } = this.props;
    return {
      margin: '0',
      paddingTop: fixedHeader ? 48 : 0,
    };
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/updateState',
      payload: {
        collapsed,
      },
    });
  };

  onTabChange = activeKey => {
    const { dispatch, panes } = this.props;
    const index = panes.findIndex(pane => pane.key === activeKey);
    const { url } = panes[index];

    // tab切换刷新白名单
    const refreshList = [
      '/user/flow/process',
      '/user/home',
      '/okr/okrMgmt/userHome',
      '/workTable/home',
    ];
    const urlParam = fromQs(url);
    if (refreshList.findIndex(key => key === activeKey) > -1) {
      urlParam.refresh = new Date().getTime();
    }
    router.push({ pathname: activeKey, query: urlParam });

    // router.push(url);
    // dispatch({
    //   type: 'global/updateState',
    //   payload: {
    //     activePane: activeKey,
    //   },
    // });
    // window.history.pushState(undefined, '', url);
  };

  onTabEdit = (targetKey, action) => {
    const { dispatch, panes, activePane } = this.props;
    if (action === 'remove') {
      if (panes.length <= 1) {
        createMessage({ type: 'warn', description: '仅剩一个页签,不能删除' });
        return;
      }
      const index = panes.findIndex(pane => pane.key === targetKey);

      if (targetKey === activePane) {
        let activeIndex = 0;
        if (index === 0) {
          activeIndex = 1;
        } else {
          activeIndex = index + 1 >= panes.length ? panes.length - 2 : index - 1;
        }
        // activeKey = panes[activeIndex].key;
        const { key } = panes[activeIndex];
        panes.splice(index, 1);
        dispatch({
          type: 'global/updateState',
          payload: {
            panes,
            // activePane: activeKey,
          },
        });
        // window.history.pushState(undefined, '', url);
        this.onTabChange(key);
      } else {
        panes.splice(index, 1);
        dispatch({
          type: 'global/updateState',
          payload: {
            panes: [...panes],
          },
        });
      }
    }
  };

  // 处理tab控制
  handleTabControlClick = ({ key }) => {
    const currentPath = window.location.pathname + window.location.search;
    const { dispatch, panes, activePane } = this.props;
    const index = panes.findIndex(pane => pane.key === activePane);
    let activeKey;
    switch (key) {
      case 'curr': {
        if (panes.length <= 1) {
          createMessage({ type: 'warn', description: '仅剩一个页签,不能删除' });
          return;
        }
        let activeIndex = 0;
        if (index === 0) {
          activeIndex = 1;
        } else {
          activeIndex = index + 1 >= panes.length ? panes.length - 2 : index - 1;
        }
        activeKey = panes[activeIndex].key;
        const { url } = panes[activeIndex];
        panes.splice(index, 1);
        dispatch({
          type: 'global/updateState',
          payload: {
            panes,
            activePane: activeKey,
          },
        });
        window.history.pushState(undefined, '', url);
        break;
      }
      case 'other': {
        dispatch({
          type: 'global/updateState',
          payload: {
            panes: [panes[index]],
          },
        });
        break;
      }
      case 'reload': {
        const urlParam = fromQs();
        urlParam.refresh = new Date().getTime();
        router.push({ pathname: window.location.pathname, query: urlParam });
        break;
      }
      default:
        break;
    }
  };

  // 侧栏样式配置控制
  renderSettingDrawer() {
    // Do show SettingDrawer in production
    const { rendering } = this.state;
    if ((rendering || process.env.NODE_ENV === 'production') && APP_TYPE !== 'site') {
      return null;
    }
    return <SettingDrawer />;
  }

  render() {
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname },
      tabData,
      metaNameSpace, // = pathname.split('/')[1],
      loading,
      logoInfo,
      extensionInfo,
      tenantAuthRoutes,
      panes,
      activePane,
      homepage,
      dispatch,
    } = this.props;
    const { isMobile, rendering } = this.state;
    const isTop = PropsLayout === 'topmenu';
    // 菜单路由配置！ 这个可以来自ajax 或者静态，就像现在这样写死。
    // 注意！tab栏的导航需要使用所有的路由数据，侧栏菜单则不用，所以这里区分开
    // Header里面会用context api把props拉出，是无过滤的
    // const menuData = this.getMenuData();
    const menuData = tenantAuthRoutes.map(temp => ({ ...temp, meta: true }));
    // eslint-disable-next-line
    // const scopedMenuData = metaNameSpace ? this.getSideMenu(metaNameSpace) : [];
    const filterMetaNav = menuData.filter(temp => temp.code === metaNameSpace);
    const scopedMenuData = filterMetaNav.length > 0 ? filterMetaNav[0].children : [];
    // const routerConfig = this.matchParamsPath(pathname);

    // const isAuthCheckDone = loading.effects['user/authChecking'] === false;
    // !! 重要注释， isAuthCheckDone 弃用，PC的生命周期非常神奇，搞不定，这里不再通过这个请求有没有发完来确定是否显示了
    // !! 转换思路，在鉴权成功后，直接刷新；为了不让页面闪烁，这里的rendering做了调整；
    // !! 所以，authChecking
    // !! 1- 返回 对象，则代表正常拉用户上下文，rendering变为false
    // !! 2- 返回 true，表示要刷新,rendering还是true，在显示loading，调用 window.location.reload() 不会闪烁
    // !! 这个项目整个时序控制都有问题………，善意提醒一下，如果再开新项目，鉴权千万千万不要参考本套PC代码
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.handleTabControlClick}>
        <Menu.Item key="reload">
          <Icon type="reload" />
          刷新当前
        </Menu.Item>
        <Menu.Item key="curr">
          <Icon type="close" />
          关闭当前
        </Menu.Item>
        <Menu.Item key="other">
          <Icon type="close" />
          关闭其它
        </Menu.Item>
      </Menu>
    );
    const operations = (
      <Dropdown overlay={menu}>
        <a className={styles.tabsControl}>
          <Icon className={styles.iconPrimaryHover} type="down-square" />
        </a>
      </Dropdown>
    );
    return (
      <>
        <DocumentTitle title={this.getPageTitle(pathname)}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>
                  {rendering ? (
                    <PageLoading />
                  ) : (
                    <Layout>
                      {isTop && !isMobile ? null : (
                        <SiderMenu
                          logo={logo}
                          Authorized={Authorized}
                          theme={navTheme}
                          onCollapse={this.handleMenuCollapse}
                          menuData={menuData}
                          scopedMenuData={scopedMenuData}
                          isMobile={isMobile}
                          logoInfo={logoInfo}
                          {...this.props}
                        />
                      )}
                      <Layout
                        style={{
                          ...this.getLayoutStyle(),
                          minHeight: '100vh',
                        }}
                      >
                        <Header
                          menuData={menuData}
                          scopedMenuData={scopedMenuData}
                          tabData={tabData}
                          handleMenuCollapse={this.handleMenuCollapse}
                          logo={logo}
                          isMobile={isMobile}
                          extensionInfo={extensionInfo}
                          {...this.props}
                        />
                        {/* 路由集成内容 */}
                        <Layout.Content style={this.getContentStyle()}>
                          {/* 因为多Tab需要 URL一样的情况依旧需要刷新字组件 多TAB在同一字组件中利用切换不同的state对象的key实现 */}
                          {/* React.cloneElement(children, { key: window.location.href }) */}
                          <Tabs
                            className={`${styles.tabsBarNew}`}
                            hideAdd
                            tabBarStyle={{
                              fontSize: '14px',
                              margin: '0 0 10px 0',
                              zIndex: '990',
                              position: 'fixed',
                              display: 'flex',
                            }}
                            onChange={this.onTabChange}
                            activeKey={activePane}
                            type="editable-card"
                            onEdit={this.onTabEdit}
                            tabBarExtraContent={operations}
                            tabBarGutter={0}
                          >
                            {panes.map(pane => (
                              <Tabs.TabPane
                                tab={pane.title}
                                key={pane.key}
                                closable={pane.key !== homepage}
                              >
                                {pane.content}
                              </Tabs.TabPane>
                            ))}
                          </Tabs>
                        </Layout.Content>
                        {/* <Footer /> */}
                      </Layout>
                    </Layout>
                  )}
                </div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
        {this.renderSettingDrawer()}
      </>
    );
  }
}

export default BasicLayout;
