import React from 'react';
import { Dropdown, Icon, Menu, Tag } from 'antd';
import classnames from 'classnames';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { getBreadcrumb } from '../../_utils/pathTools';
import styles from './index.less';

/**
 * !! 首页关闭按钮去除代码
 * 记录其国际化翻译。在翻译之后做比对，如果是首页，不显示删除按钮
 * checkIfCloseable 由 > 0 调整为 > 1  当然这个调整也可以不做的
 */
const HOME_LOCALE = 'ui.menu.user.home';

class TabBar extends React.Component {
  state = {
    tabOffset: 0,
  };

  getResName(url) {
    const { breadcrumbNameMapUnlimited } = this.props;
    // to 开发者: 路由本身就是URL路径作为唯一识别进行定位，额外的数据处理全部在路由上配置
    // 如果有需求变更之类的，直接在路由里面配置获取，在此处format输出(比如自定义名称之类的)。
    const { locale = 'ui.menu.missing' } = getBreadcrumb(breadcrumbNameMapUnlimited, url);
    // console.log('currentBreadcrumb ->', locale);
    // return formatMessage({ id: locale, desc: url });
    return {
      code: locale,
      transform: formatMessage({ id: locale, desc: url }),
    };
  }

  checkIfCloseable = () => {
    const { tabData } = this.props;
    // console.log('[EL-TABS]: closing tab ->', window.location.pathname, item);
    return tabData.length > 1;
  };

  // TODO: js长字符串比较有性能问题，因为不是异或比较。(这个概念我也不是很确定，但是听说过)
  // PS:项目后期有时间考证一下，属于优化项，无功能影响
  // 如果有的话 超过512字节(url最长2048字节)的字符串比较 应当hash之后比较摘要(这部分会产生额外性能消耗，hash算法比如sha之类跑这么短长度的代码跑的还是很快的，应该不会很久) 以提示性能节约时间。
  // @deprecated
  checkIfFocused = item => item === window.location.pathname + window.location.search;

  // check every time when tabs changed.
  shiftBarLeft = e => {
    if (!this.$tabContainer.offsetWidth) return;
    const { tabOffset } = this.state;
    const totalTabOffset = this.$tabContainer.offsetWidth - this.$tabWrapper.offsetWidth;
    if (totalTabOffset < 0) {
      // 计算当前所需的offset为显示总长度的currentStride倍
      // const totalStride = Math.floor(this.$tabWrapper.offsetWidth / this.$tabContainer.offsetWidth);
      const currentStride = Math.floor(
        Math.abs(totalTabOffset - tabOffset) / this.$tabContainer.offsetWidth
      );
      // offset大于至少一倍，但是又小于总步数，基于原来递进一步。
      this.setState({
        tabOffset: currentStride > 0 ? tabOffset - this.$tabContainer.offsetWidth : totalTabOffset,
      });
    }
  };

  // check every time when tabs changed.
  shiftBarRight = e => {
    if (!this.$tabContainer.offsetWidth) return;
    const { tabOffset } = this.state;
    const totalTabOffset = this.$tabContainer.offsetWidth - this.$tabWrapper.offsetWidth;
    if (totalTabOffset < 0) {
      // 计算当前所需的offset为显示总长度的currentStride倍
      const totalStride = Math.floor(this.$tabWrapper.offsetWidth / this.$tabContainer.offsetWidth);
      const currentStride = Math.floor(
        Math.abs(totalTabOffset - tabOffset) / this.$tabContainer.offsetWidth
      );
      // 这个正好与上方操作相反。
      this.setState({
        tabOffset: currentStride < totalStride - 1 ? tabOffset + this.$tabContainer.offsetWidth : 0,
      });
    }
  };

  handleTabSwitch = (e, item) => {
    const { onSwitchTab } = this.props;
    onSwitchTab(e, item);
  };

  handleCloseTab = (item, e) => {
    e && e.stopPropagation(); // wont work.
    // console.log('tab closing... ->', item);
    const { tabData, onCloseTab } = this.props;
    if (this.checkIfCloseable()) {
      onCloseTab({}, tabData.filter(path => path !== item), true);
    }
  };

  handleCloseOtherTab = item => {
    const { onCloseTab, tabData } = this.props;
    if (this.checkIfCloseable()) {
      // console.log('calling close ->', item);
      onCloseTab({}, tabData.filter(path => path === item));
    }
  };

  // @deprecated
  handleCloseLeftTab = item => {
    const { onCloseTab, tabData } = this.props;
    if (this.checkIfCloseable()) {
      if (tabData.indexOf(item) > 0) {
        onCloseTab({}, tabData.slice(tabData.length - tabData.indexOf(item)));
      }
    }
  };

  // 处理tab控制
  handleTabControlClick = ({ key }) => {
    const currentPath = window.location.pathname + window.location.search;
    switch (key) {
      case 'curr':
        // eslint-disable-next-line
        // console.log('[EL-TABS]: closing current tab! currentPath ->', currentPath);
        return this.handleCloseTab(currentPath);
      case 'other':
        // eslint-disable-next-line
        // console.log('[EL-TABS]: closing other tabs! currentPath ->', currentPath);
        return this.handleCloseOtherTab(currentPath);
      case 'left': // 暂时未实现。
        // eslint-disable-next-line
        // console.log('[EL-TABS]: closing left tabs! currentPath ->', currentPath);
        return this.handleCloseLeftTab(currentPath);
      default:
        return false;
    }
  };

  render() {
    /**
     * tabData本质上是由外部更新传入此组件渲染的。
     * 这个组件也只是提供操作tabData的事件框架，控制也是由外部执行。
     */
    const { theme, tabData, focusFilter = this.checkIfFocused, homepage } = this.props;
    const { tabOffset } = this.state;

    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.handleTabControlClick}>
        <Menu.Item key="curr">
          <Icon type="close" />
          <FormattedMessage id="ui.menu.tabs.close.current" defaultMessage="close current tab" />
        </Menu.Item>
        <Menu.Item key="other">
          <Icon type="close" />
          <FormattedMessage id="ui.menu.tabs.close.others" defaultMessage="close other tabs" />
        </Menu.Item>
      </Menu>
    );

    // console.warn('[EL-TABS]: Received new tab data from parent ->', this.props);
    return (
      <div className={`${styles.tabsBar} ${theme === 'light' ? styles.light : ''}`}>
        <a className={styles.tabsControl} onClick={this.shiftBarRight}>
          <Icon className={styles.iconPrimaryHover} type="double-left" />
        </a>
        <div
          className={styles.tabsContainer}
          ref={ref => {
            this.$tabContainer = ref;
          }}
        >
          <div
            className={styles.tabsWrapper}
            style={{ marginLeft: tabOffset }}
            ref={ref => {
              this.$tabWrapper = ref;
            }}
          >
            {tabData.map((item, k) => {
              const { code, transform } = this.getResName(
                item.split('?')[0]
              ); /* 路由找名称就不带参数了～(可以搞，只不过没需求，所以不做了。) */
              // 做一下优化 获取当前链接
              const itemUrl = item.split('?')[0];
              const showCloseButton = itemUrl !== homepage && tabData.length > 1;
              return (
                <span
                  key={item /* 路径暂时必须唯一 */}
                  ref={ref => {
                    /* Tag组件不能用ref */
                    if (k === tabData.length - 1) {
                      // console.log('tabData.length, k', ref);
                      this.$lastItem = ref;
                    }
                  }}
                >
                  <Tag
                    className={classnames(styles.tag, focusFilter(item) ? styles.tagActive : '')}
                    closable={0}
                    onClick={e => this.handleTabSwitch(e, item)}
                  >
                    <span className="m-r-1" data-href={item} data-instance-key={0}>
                      {transform}
                    </span>
                    {showCloseButton && (
                      <a onClick={e => this.handleCloseTab(item, e)}>
                        <Icon
                          className={classnames(
                            styles[focusFilter(item) ? 'iconLight' : 'iconText'],
                            styles.iconDelete
                          )}
                          type="close"
                        />
                      </a>
                    )}
                  </Tag>
                </span>
              );
            })}
          </div>
        </div>
        <a className={styles.tabsControl} onClick={this.shiftBarLeft}>
          <Icon className={styles.iconPrimaryHover} type="double-right" />
        </a>
        <Dropdown overlay={menu}>
          <a className={styles.tabsControl}>
            <Icon className={styles.iconPrimaryHover} type="down-square" />
          </a>
        </Dropdown>
      </div>
    );
  }
}

export default TabBar;
