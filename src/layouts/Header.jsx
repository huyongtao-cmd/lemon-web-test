import React, { PureComponent } from 'react';
import { Layout, message } from 'antd';
import Animate from 'rc-animate';
import { connect } from 'dva';
import router from 'umi/router';
import { getLocale, setLocale } from 'umi/locale';
import { isNil } from 'ramda';
import { stringify } from 'qs';

import GlobalHeader from '@/components/layout/GlobalHeader';
import TabBar from '@/components/layout/TabBar';
import TopNavHeader from '@/components/layout/TopNavHeader';
import styles from './Header.less';
import Authorized from '@/layouts/Authorized';
import { getMeta } from '@/utils/envUtils';
import MenuContext from '@/layouts/MenuContext';
import { createNotify } from '@/components/core/Notify';

import { markAsTab } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';

const { Header } = Layout;

@connect(({ user: { user }, global, uiSettings, loading }) => ({
  user,
  collapsed: global.collapsed,
  isFetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
  notifyCount: global.notifyCount,
  setting: uiSettings,
  meta: global.meta,
  homepage: global.homepage,
}))
class HeaderView extends PureComponent {
  state = {
    learningLink: undefined,
    ReportChartLink: undefined,
    visible: true,
    meta: this.props.meta, // eslint-disable-line
  };

  static getDerivedStateFromProps(props, state) {
    if (!props.autoHideHeader && !state.visible) {
      return {
        visible: true,
      };
    }
    if (props.meta !== state.meta) {
      return {
        meta: props.meta,
      };
    }
    return null;
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/getELearningLink',
      payload: true,
    }).then(link => {
      if (!isNil(link)) {
        this.setState({ learningLink: link });
      }
    });
    this.onReportChart();
    document.addEventListener('scroll', this.handScroll, { passive: true });
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handScroll);
  }

  getHeadWidth = () => {
    const { isMobile, collapsed, setting } = this.props;
    const { fixedHeader, layout } = setting;
    if (isMobile || !fixedHeader || layout === 'topmenu') {
      return '100%';
    }
    return collapsed ? 'calc(100% - 80px)' : 'calc(100% - 220px)';
  };

  // -------- 系统事件控制(START) --------

  handleNoticeClear = type => {
    message.success(`清空了${type}`);
    const { dispatch } = this.props;
    dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  };

  handleMetaSwitch = (e, name) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/updateState',
      payload: { meta: name },
    });
    this.setState({
      meta: name,
    });
    // this.metaDefaultPage(name);
  };

  /**
   * 添加工作台点击时的默认页面
   */
  metaDefaultPage = name => {
    let goToUrl = '';
    const urlBox = ['org', 'okr'];
    switch (name) {
      case 'org':
        goToUrl = '/org/bu/center';
        break;
      case 'okr':
        goToUrl = '/okr/okrMgmt/userHome';
        break;
      default:
        goToUrl = '';
    }
    if (urlBox.includes(name)) {
      router.push(goToUrl);
    }
  };

  handleMenuClick = ({ key }) => {
    const { dispatch, ELearningLink } = this.props;
    if (key === 'userCenter') {
      router.push('/center/home');
      return;
    }
    if (key === 'userinfo') {
      // router.push('/settings/base');
      router.push('/user/center/info');
      return;
    }
    if (key === 'userPassword') {
      // router.push('/settings/base');
      router.push('/user/center/changepwd');
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      }).then(() => {
        dispatch({
          type: 'RESET',
        });
      });
    }
  };

  // 在不影响原有逻辑的基础上添加右上角辅助菜单
  handleExtensionMenuClick = ({ item, key }) => {
    const { props = {} } = item;
    const jumpUrl = props['data-url'];
    if (jumpUrl) {
      // 头部右侧菜单收缩后点击跳转
      if (key === 'appDownload') {
        window.open(jumpUrl);
        return;
      }
      if (key === 'E-learning') {
        this.onELearning();
        return;
      }
      if (key === 'help') {
        const urls = getUrl();
        const from = stringify({ url: urls });
        router.push(`${jumpUrl}?${from}`);
        return;
      }
      if (key === 'feedback') {
        const urls = getUrl();
        const from = stringify({ fromPage: urls });
        router.push(`/user/feedback?${from}`);
        return;
      }
      router.push(jumpUrl);
    }
  };

  handleNoticeVisibleChange = visible => {
    if (visible) {
      const { dispatch } = this.props;
      dispatch({
        type: 'global/fetchNotices',
      });
    }
  };

  focusFilter = item =>
    markAsTab(item) === markAsTab(window.location.pathname + window.location.search);

  handleTabSwitch = (e, item) => {
    // console.log('click on item ->', item);
    const { dispatch } = this.props;
    const pathMeta = getMeta(item);
    if (pathMeta) {
      // 注意！这个方法不是异步的。
      dispatch({
        type: 'global/updateState',
        payload: {
          meta: pathMeta,
        },
      });
      // router.push(item);
      this.jumpToTab(item);
    }
    return item;
  };

  handScroll = () => {
    const { autoHideHeader } = this.props;
    const { visible } = this.state;
    if (!autoHideHeader) {
      return;
    }
    const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (!this.ticking) {
      requestAnimationFrame(() => {
        if (this.oldScrollTop > scrollTop) {
          this.setState({
            visible: true,
          });
          this.scrollTop = scrollTop;
          return;
        }
        if (scrollTop > 300 && visible) {
          this.setState({
            visible: false,
          });
        }
        if (scrollTop < 300 && !visible) {
          this.setState({
            visible: true,
          });
        }
        this.oldScrollTop = scrollTop;
        this.ticking = false;
      });
    }
    this.ticking = false;
  };

  /**
   * 切换帮助模式
   */
  handleHelpDisplay = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeHelpDisplay',
    });
  };

  /**
   * 跳转 E-Learning 网站
   */
  onELearning = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/getELearningLink',
    }).then(link => {
      if (!isNil(link)) {
        const a = document.createElement('a');
        // a.style = 'display: none';
        a.style.display = 'none';
        a.href = link;
        a.target = '_blank';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  };

  /**
   * 跳转 报表 网站
   */
  onReportChart = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/getReportChartLink',
    }).then(link => {
      if (!isNil(link)) {
        this.setState({ ReportChartLink: link });
        window.sessionStorage.setItem('REPORT_PLAT', link);
      }
    });
  };

  /**
   * 国际化切换 - 这里只有两种语言所以是异或关系
   * antd pro的多语言做成了一个下拉，以后增加了可以参考一下
   */
  handleLangChange = () => {
    const { dispatch } = this.props;
    const locale = getLocale();
    if (!locale || locale === 'zh-CN') {
      dispatch({
        type: 'global/changeLang',
        payload: {
          lang: 'en-US',
        },
      }).then(code => (code ? createNotify({ code }) : setLocale('en-US')));
    } else {
      dispatch({
        type: 'global/changeLang',
        payload: {
          lang: 'zh-CN',
        },
      }).then(code => (code ? createNotify({ code }) : setLocale('zh-CN')));
    }
  };

  /**
   * 多Tab导航Tab关闭事件
   * @param e
   * @param filteredTabData
   * @param isGoto
   */
  handleCloseTab = (e, filteredTabData, isGoto) => {
    // console.log('isGoto, filteredTabData ->', isGoto, filteredTabData);
    const { dispatch } = this.props;
    // const currentPath = window.location.pathname;
    dispatch({
      type: 'global/updateState',
      payload: {
        tabData: filteredTabData,
      },
    });
    if (isGoto) {
      // super hack.
      this.jumpToTab(filteredTabData.pop());
    }
  };

  jumpToTab = tabPath => router.push(markAsTab(tabPath));

  // -------- 系统事件控制(END) --------

  render() {
    const {
      isMobile,
      handleMenuCollapse,
      setting,
      tabData,
      dispatch,
      collapsed,
      homepage,
    } = this.props;
    const { navTheme, layout, fixedHeader } = setting;
    const { visible, meta, learningLink, ReportChartLink } = this.state;
    const isTop = layout === 'topmenu';
    const width = this.getHeadWidth();

    // 加 left 是因为某些页面内部刷新时，布局定位错乱；现在加判断做各种情况的 left 兼容。。。
    const desktopLeft = collapsed ? 80 : 220;
    const left = isMobile ? 0 : desktopLeft;

    const HeaderDom = visible ? (
      <Header
        style={{ width, left }}
        className={[styles.wrapper, fixedHeader ? styles.fixedHeader : '']}
      >
        {isTop && !isMobile ? (
          <TopNavHeader
            theme={navTheme}
            mode="horizontal"
            Authorized={Authorized}
            onCollapse={handleMenuCollapse}
            onNoticeClear={this.handleNoticeClear}
            onMenuClick={this.handleMenuClick}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
            {...this.props}
          />
        ) : (
          <>
            <GlobalHeader
              onCollapse={handleMenuCollapse}
              onNoticeClear={this.handleNoticeClear}
              onMetaSwitch={this.handleMetaSwitch}
              onMenuClick={this.handleMenuClick}
              onExtensionMenuClick={this.handleExtensionMenuClick}
              onNoticeVisibleChange={this.handleNoticeVisibleChange}
              onChangeLang={this.handleLangChange}
              onDisplayHelp={this.handleHelpDisplay}
              onELearning={this.onELearning}
              ReportChartLink={ReportChartLink}
              ELearningLink={learningLink}
              onActiveMeta={meta}
              {...this.props}
            />
          </>
        )}
      </Header>
    ) : null;
    return (
      <Animate component="" transitionName="fade">
        {HeaderDom}
      </Animate>
    );
  }
}

export default HeaderView;
