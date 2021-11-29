import React, { PureComponent } from 'react';
import { Icon } from 'antd';
import Link from 'umi/link';
import Debounce from 'lodash-decorators/debounce';
import styles from './index.less';
import RightContent from './RightContent';
import RightContentMenu from './RightContentMenu';
import TopMenu from './TopMenu';

export default class GlobalHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      menuChange: false,
      headerMenuWidth: 0,
      workPlatWidth: 0,
      rightMenuWidth: 0,
    };
  }

  // didMount时注册事件
  componentDidMount() {
    window.addEventListener('resize', this.handleResize.bind(this)); // 监听窗口大小改变
  }

  // UnMount时注卸载事件
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
    window.removeEventListener('resize', this.handleResize.bind(this)); // 移除监听窗口大小改变
  }

  /* eslint-disable */
  @Debounce(600)
  triggerResizeEvent() {
    // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };

  // 当浏览器尺寸变化时菜单灵活切换，代码和计算比较生硬，没有想到其他比较好的方法
  handleResize = e => {
    const { headerMenuWidth, workPlatWidth, rightMenuWidth } = this.state;
    const windowWidth = e.target.innerWidth;
    const platRightWidth = workPlatWidth + rightMenuWidth;

    if (windowWidth < platRightWidth + 300 && rightMenuWidth > 250) {
      this.setState({
        menuChange: true,
      });
    }
    if (windowWidth > platRightWidth + 600 && rightMenuWidth < 250) {
      this.setState({
        menuChange: false,
      });
    }
  };

  render() {
    const { collapsed, isMobile, logo, menuData } = this.props;
    const { menuChange } = this.state;

    // 页面初始化只执行一次，根绝当前工作台菜单长度和顶部右侧菜单长度控制顶部右侧菜单显示方式
    if (this.headerMenu && this.workPlat && this.rightMenu) {
      this.setState({
        headerMenuWidth: this.headerMenu.clientWidth,
        workPlatWidth: this.workPlat.clientWidth,
        rightMenuWidth: this.rightMenu.clientWidth,
      });
      if (
        !menuChange &&
        this.workPlat.clientWidth + this.rightMenu.clientWidth >= this.headerMenu.clientWidth
      ) {
        this.setState({
          menuChange: true,
        });
      }
    }

    return (
      <div
        ref={e => {
          this.headerMenu = e;
        }}
        className={styles.header}
      >
        {isMobile && (
          <Link to="/" className={styles.logo} key="logo">
            <img src={logo} alt="logo" width="32" />
          </Link>
        )}
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        {/* 套个div标签用来获取工作台菜单总宽度 */}
        <div
          ref={e => {
            this.workPlat = e;
          }}
          style={{ display: 'inline-block' }}
        >
          <TopMenu {...this.props} menuData={menuData.filter(menu => menu.meta)} />
        </div>
        <div
          ref={e => {
            this.rightMenu = e;
          }}
          style={{ float: 'right' }}
        >
          {menuChange ? <RightContentMenu {...this.props} /> : <RightContent {...this.props} />}
        </div>
      </div>
    );
  }
}
